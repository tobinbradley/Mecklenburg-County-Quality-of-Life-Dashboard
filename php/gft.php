<?php
/**
 * Google Fusion Tables API
 *
 * These are PHP5 classes used to interact with the Google Fusion Tables API.
 * The googleBase class provides an authentication class that any classes interacting
 * with the Google API will need.  It should be extended by a service-specific class
 * that makes all of the calls to this class.
 *
 * The googleFusion class provides a public 'query()' method, allowing for SQL queries
 * to be performed on Fusion Tables.  This class could be extended or modified to
 * include purpose-specific methods that handles the query SQL.
 *
 * Code mostly from http://geeklad.com/google-fusion-tables-could-be-a-game-changer
 *
 * This code hosted at https://gist.github.com/1280261
 *
 * @license   MIT
 */

if( !class_exists('googleBase') ):

/**
 * Google API Base Class
 *
 * This class provides a very simple base for building Google API classes from.
 * It provides the basic necessities: the authentication interface for Google's APIs.
 */
abstract class googleBase
{
   /**
    * Google Username
    *
    * @var      string
    * @access   protected
    */
    protected $username;

   /**
    * Google Password
    *
    * @var      string
    * @access   protected
    */
    protected $password;

   /**
    * Google API Service
    *
    * @var      string
    * @access   protected
    */
    protected $service;

   /**
    * Google Auth Token
    *
    * @var      string
    * @access   protected
    */
    protected $token = false;

   /**
    * Google Authentication
    *
    * Authenticates user credentials and sets the {@link $token} property.
    * For a list of available services, see {@link http://code.google.com/apis/gdata/faq.html#clientlogin}.
    *
    * @param    string  $username   The username to use to authenticate the connection.
    * @param    string  $password   The password to use to authenticate the connection.
    * @param    string  $service    The google service we're authenticating access to.
    * @return   bool                True if authentication passed, false if not.
    * @access   protected
    */
    protected function _google_auth( $username, $password, $service )
    {
        if(!$username || !$password || !$service) {
            //echo("You must provide a username, password, and service when creating a new GoogleClientLogin.");
        }
        else {

            $this->username = $username;
            $this->password = $password;
            $this->service  = $service;
            
            $auth_params = array(
                'accountType'   => 'HOSTED_OR_GOOGLE',
                'Email'         => $username,
                'Passwd'        => $password,
                'service'       => $service
            );
    
            $curl = curl_init('https://www.google.com/accounts/ClientLogin');
    
            curl_setopt_array($curl, array(
                CURLOPT_POST            => true,
                CURLOPT_POSTFIELDS      => $auth_params,
                CURLOPT_HTTPAUTH        => CURLAUTH_ANY,
                CURLOPT_SSL_VERIFYPEER  => false, // !! Important !!
                CURLOPT_RETURNTRANSFER  => true
            ));
    
            $response = curl_exec($curl);
    
            if( preg_match("/Auth=([a-z0-9_\-]+)/i", $response, $matches) )
            {
                $this->token  = $matches[1];
                return true;
            }
            else
            {
                preg_match("/Error=([a-z0-9_\-]+)/i", $response, $matches);
                throw new Exception('Auth Error: '. $matches[1] ." ". curl_error($curl));
                return false;
            }
        }
    }
}

endif; // Endof !class_exists()



/**
 * Google Fusion Tables API Class
 *
 * Provides a query interface for Google fusion tables.
 */
class googleFusion extends googleBase
{
   /**
    * Query URL
    *
    * @var      string
    * @access   protected
    */
    protected $query_url = 'http://tables.googlelabs.com/api/query';
    
   /**
    * Class Constructor
    *
    * Attempts to authenticate user and create an instance of this class.
    *
    * @param    string  $username   The google account username
    * @param    string  $password   The google account password
    * @return   void
    * @access   public
    */
    public function __construct( $username, $password )
    {
        if( !$this->_google_auth( $username, $password, 'fusiontables' ) )
            return false;
    }

   /**
    * Perform Tables SQL Query
    *
    * This performs an SQL query via the Google Fusion Tables API and returns the results.
    * SQL params/docs at http://code.google.com/apis/fusiontables/docs/developers_guide.html
    *
    * @param    string  $query  The SQL query to perform
    * @return   array           An array of results or (bool)false on failure
    * @access   public
    */
    public function query( $query )
    {
        if( strlen($query) < 1 )
            throw new Exception('Query must be a valid query string!');

        // Check for a GET request
        if( preg_match('/^select|^show tables|^describe/i', $query) )
        {
            $curl = curl_init($this->query_url .'?sql='. urlencode($query));
            
            curl_setopt_array($curl, array(
                CURLOPT_HTTPHEADER      => array('Authorization: GoogleLogin auth='. $this->token),
                CURLOPT_RETURNTRANSFER  => true
            ));
        }
        // Check for a POST request
        elseif( preg_match('/^update|^delete|^insert/i', $query) )
        {
            $query = 'sql='. urlencode($query);
            $curl  = curl_init($this->query_url);

            curl_setopt_array($curl, array(
                CURLOPT_POST            => true,
                CURLOPT_POSTFIELDS      => $query,
                CURLOPT_RETURNTRANSFER  => true,
                CURLOPT_HTTPHEADER      => array(
				    'Content-length: ' . strlen($body),
				    'Content-type: application/x-www-form-urlencoded',
				    // Extra space after token prevents error: Syntax error near line 1:1: unexpected token: null
				    'Authorization: GoogleLogin auth='. $this->token .' '
			    )
            ));
        }
        else
        {
            throw new Exception('Invalid SQL query type given!');
        }
        
        // Convert new lines in the results into an array
        $results = preg_split( "/\n/", curl_exec($curl) );
        
        // Check for request error and handle it
        if( curl_getinfo($curl, CURLINFO_HTTP_CODE) != 200 )
            return $this->_output_error( $results );

        // Drop last array value, which will be empty
        array_pop($results);

        return $this->_parse_output( $results );
    }
	
   /**
    * Parse Output Data
    *
    * Parses the returned data from the query and returns the data as an array.
    *
    * @param    array   $results    Takes the array of results and parses the data.
    * @return   array
    * @access   private
    */
    private function _parse_output( $results )
    {
        $headers = false;
        $output  = array();

        foreach( $results as $row )
        {
            // Get the headers
            if( !$headers )
            {
                $headers = $this->_parse_row($row);
            }
            else
            {
                // Create a new row for the array
                $newrow = array();
                $values = $this->_parse_row($row);

                // Build an associative array, using the headers for the keys
                foreach( $headers as $index => $header )
                {
                    $newrow[$header] = $values[$index];
                }

                // Add the new array to the output array
                array_push($output, $newrow);
            }
        }

        // Return the output
        return $output;
    }

   /**
    * Parse Result Row
    *
    * Parses the given row of data and returns the results.
    *
    * @param    string   $row   The row from the results to parse
    * @return   array           The parsed array of data
    * @access   private
    */
    private function _parse_row($row)
    {
        // Split the comma delimted row
        $cells = preg_split("/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/", $row);
        // Loop over each column and remove ending double-quotes and white-space
        foreach( $cells as $k => $v )
            $cells[$k] = trim($v, '"');
            
        return $cells;
    }

   /**
    * Output Error
    *
    * Handles displaying any errors from the query results.
    *
    * @param    array   $err    The array of error info
    * @return   void
    * @access   private
    * @todo     This probably should be moved to the googleBase class.
    */
	private function _output_error( $err )
	{
		$err = implode("", $err);
		
		// Remove everything outside of the H1 tag
		$err = preg_replace('/[\s\S]*<H1>|<\/H1>[\s\S]*/i', '', $err);
		
		// Return the error
		return $err;
		
		// Eventually we'll just throw the error rather than return the error output
		throw new Exception($err);
	}
}


// USAGE EXAMPLE

// Create a new instance of googleFusion
//$ft = new googleFusion('yourname@gmail.com', 'yourpassword'); 

// Have fun!  Use the googleFusion->query method to run queries.
// It will automatically take care of using the GET or POST method, depending on the type of query
// The output is an array of associative arrays.
// The associative arrays use the csv headers for the keys, and the values are the values in the csv columns
//$output = $ft->query("SELECT * FROM FOOTABLE WHERE FOO=1");
//$ft->query("INSERT INTO FOOTABLE (FOO,BAR) VALUES (1,2)");