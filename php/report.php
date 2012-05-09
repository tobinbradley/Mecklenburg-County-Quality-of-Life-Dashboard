<?php

/**
 * Set content header
 */
header('Content-type: application/pdf');
//error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);

/**
 * Load Dependecies
 */
require('fpdf17/fpdf.php');
require('gft.php');



// GFT table ID
$tableID = 1844838;

// Colors for the aux chart
$chartColors = array("FEDFAC", "D2E6A0", "F8A6CB", "6BA5BF", "FDEC6C");

/**
 * Get form variables
 */
$neighborhood = $_REQUEST['n'];
$measures = $_REQUEST['m'];

/**
 * Load data JSON
 */
$string = file_get_contents("../js/metrics.json");
$json = json_decode($string, true);

/**
 * Get complete metrics fields array
 */
$metrics = array();
foreach ($json as $value) {
    array_push($metrics, $value[field]);
}


/**
 * Get array of fields from metrics.json
 */
function getFieldsArray($data) {
    $fieldList = array();
    foreach ($data as $value) {
        array_push($fieldList, $value["field"]);
    }
    return $fieldList; 
}



 
/**
 * Load neighborhood information from Google Fusion Tables
 */
if (count($measures) > 0) {
    // neighborhood    
    
    $ft = new googleFusion();
    $gft_neighborhood = $ft->query("select * FROM " . $tableID . " WHERE ID = " . $neighborhood);
    
    // county average
    for ($i = 0; $i < count($measures); ++$i) {
        $avg[$i] = "average(" .  $measures[$i] . ") as " . $measures[$i];
    }
    $gft_average = $ft->query("select " . implode(",", $avg) . " FROM " . $tableID);
}



/**
 * Extend FPDF for header/footer/etc.
 */
class PDF extends FPDF
{
    // Page footer
    function Footer()
    {
        // Position at 1.5 cm from bottom
        $this->SetY(-0.4);
        // Arial italic 8
        $this->SetFont('Arial','I',8);
        $this->SetTextColor(0,0,0); 
        // Page number
        $this->Cell(0,0,'Quality of Life Dashboard - http://maps.co.mecklenburg.nc.us/qoldashboard/',0,0,'C');
    }
}


/**
 * Create PDF
 */
$pdf = new PDF('P','in','Letter');


/************************************************************/
/*                 Cover Page                               */
/************************************************************/
$pdf->AddPage();


// Title page image background
$pdf->Image('report_cover_page.png',0,0,8.5);

// White text on top of title page
$pdf->SetTextColor(255,255,255);

// Title page header
$pdf->SetFont('Arial','B',40);
$pdf->Ln(0.8);
$pdf->Cell(0.3);
$pdf->Cell(0,0, "Neighborhood Profile Area");

// Title page neighborhood
$pdf->SetFont('Arial','B',180);
$pdf->Ln(1.8);
$pdf->Cell(0.3);
//$pdf->Cell(1.7);
$pdf->Cell(0, 0, $neighborhood); 

// Title page main content
$pdf->Ln(3.8);
$pdf->Cell(1);
$pdf->SetTextColor(0,0,0);
$pdf->SetFont('Arial','', 14);
$text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce elementum tortor vitae tortor dapibus quis porta est fringilla. Etiam vulputate erat id purus elementum scelerisque. Sed id risus nisi, at dapibus nisi. Aliquam in enim eu odio gravida interdum sed sed odio. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras ullamcorper ornare augue. Nulla mollis orci quis quam pulvinar semper. Pellentesque interdum libero vitae enim ultrices faucibus. Duis vel enim eget ipsum aliquet sollicitudin in ut massa. In diam lacus, sodales id ornare eu, dictum et sem. Fusce iaculis viverra tortor, et volutpat nulla posuere quis.";
$pdf->MultiCell(5.8, 0.2, $text);


/************************************************************/
/*                 Create Map Page                          */
/************************************************************/
$pdf->AddPage();

// Get map extent
$extent = file_get_contents('http://maps.co.mecklenburg.nc.us/rest/v1/ws_geo_getextent.php?srid=2264&geotable=neighborhoods&format=json&parameters=id=' . $neighborhood);
$extentJSON = json_decode($extent, true);
$ditch = array("BOX(",")", " ");
$replace = array("","", ",");
$final_extent =  explode(",", str_replace($ditch, $replace,$extentJSON[rows][0][row][extent]));

$dx = $final_extent[2] - $final_extent[0];
$dy = $final_extent[3] - $final_extent[1];
if ($dx >= $dy) {
    $delta = (($dx - $dy) / 2) * 1.12; 
    $final_extent[1] = $final_extent[1] - $delta; 
    $final_extent[3] = $final_extent[3] + $delta; 
}
else {
    $delta = (($dy - $dx) / 2) * 0.77; 
    $final_extent[0] = $final_extent[0] - $delta; 
    $final_extent[2] = $final_extent[2] + $delta;
}

$final_extent[0] = $final_extent[0] - 250;
$final_extent[1] = $final_extent[1] - 250;
$final_extent[2] = $final_extent[2] + 250;
$final_extent[3] = $final_extent[3] + 250;

// Put map image (WMS) on page
$mapURL = "http://maps.co.mecklenburg.nc.us/geoserver/wms/reflect?layers=meckbase,neighborhoods&width=800&bbox=" . implode(",", $final_extent) . "&srs=EPSG:2264&CQL_FILTER=include;id=" . $neighborhood;
$pdf->Image($mapURL,0.3,0.3,7.9, 10, "PNG");

$pdf->SetLineWidth(0.05);
$pdf->rect(0.3,0.3,7.9, 10);

/************************************************************/
/*                 Create Measure Function                           */
/************************************************************/
function createMeasure($x, $y, $themeasure) {

    global $pdf, $json, $gft_neighborhood, $gft_average, $chartColors;
    
    $pdf->SetTextColor(0,0,0);    
    $pdf->SetY($y);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',12);    
    $pdf->Write(0, $json[$themeasure][title] );
    $pdf->Ln(0.2);
    $pdf->SetX($x);
    $pdf->Write(0, $gft_neighborhood[0][$json[$themeasure]["field"]] . $json[$themeasure]["style"]["units"]);
    //$pdf->Cell(0, 0, $gft_neighborhood[0][$json[$themeasure]["field"]] . $json[$themeasure]["style"]["units"], 0, 0, 'C');
    $pdf->Ln(0.2);
    $pdf->SetX($x);
    $chartMax = ($gft_neighborhood[0][$json[$themeasure]["field"]] >= round($gft_average[0][$json[$themeasure]["field"]]) ? $gft_neighborhood[0][$json[$themeasure]["field"]] : round($gft_average[0][$json[$themeasure]["field"]]));
    $chartMax = ($chartMax > 100 ? $chartMax + 100 : 100 );    
    $pdf->Image( "http://chart.apis.google.com/chart?chxr=0,0," . $chartMax . "&chxl=1:|2010&chxt=x,y&chbh=a,4,9&chs=250x75&cht=bhg&chco=FF9900,FFCA7A&chds=0," . $chartMax . ",0," . $chartMax . "&chd=t:" . $gft_neighborhood[0][$json[$themeasure]["field"]] . "|" . round($gft_average[0][$json[$themeasure]["field"]]) . "&chdl=Neightborhood|County+Average&chdlp=t&chg=-1,0", null , null, 0, 0, "PNG");
    $pdf->Ln(0.2);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "What is this Indicator?");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',10);
    $pdf->MultiCell(3.5, 0.15, $json[$themeasure][description], 0, "L");
    if ($json[$themeasure][auxchart]) {
        $pdf->Ln(0.2);
        $pdf->SetX($x);
        $measureTitles = array();
        $measureValues = array();
        foreach ($json[$themeasure]["auxchart"]["measures"] as $value) {
            if ($gft_neighborhood[0][$value] > 0) {
                array_push($measureTitles,  $gft_neighborhood[0][$value] . $json[$value][style][units]. " " . $json[$value][title]);
                //array_push($measureTitles,  $json[$value][title]);
                array_push($measureValues, $gft_neighborhood[0][$value]);
            }
        }
        $comma_separated = implode(",", $json[$themeasure]["auxchart"]["measures"]);
        $auxContent = "http://chart.apis.google.com/chart?chf=bg,s,00000000&chs=320x165&cht=p&chp=0.1";
        //$auxContent .= "&chd=t:" . implode(",", $measureValues) . "&chdl=" . str_replace(" ", "+", implode("|", $measureTitles)) . "&chco=" . implode(",", $chartColors);
        $auxContent .= "&chd=t:" . implode(",", $measureValues) . "&chdl=" . str_replace(" ", "+", implode("|", $measureTitles)) . "&chco=";
        $pdf->Image( $auxContent, null , null, 0, 0, "PNG");
    }
    $pdf->Ln(0.2);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "Why is this Important?");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',10);
    $pdf->MultiCell(3.5, 0.15, $json[$themeasure][importance], 0, "L");
    $pdf->Ln(0.2);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "Technical Notes");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',10);
    $pdf->MultiCell(3.5, 0.15, $json[$themeasure][tech_notes], 0, "L");
    $pdf->Ln(0.2);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "Data Source");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',10);
    $pdf->MultiCell(3.5, 0.15, $json[$themeasure][source], 0, "L");
    $pdf->Ln(0.2);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "Additional Resources");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',9);
    $pdf->SetTextColor(0,0,255);
    $pdf->SetFont('','U');
    $count = count($json[$themeasure][links][text]);
    for ($i = 0; $i < $count; $i++) {
        $pdf->Write(0.2, $json[$themeasure][links][text][$i],$json[$themeasure][links][links][$i]);
        $pdf->Ln(0.15);
        $pdf->SetX($x);
    }
    
}



/************************************************************/
/*                 Data Report                              */
/************************************************************/
// loop for each page - 4 measures per page
if (strlen($measures[0]) > 0) {
    $measureCount = 0;
    for ($i=0; $i < ceil(count($measures) / 2); $i++) {
        // add page    
        $pdf->AddPage();
        
        if ($measures[ $measureCount]) createMeasure(0.5, 0.5, $measures[$measureCount]);
        if ($measures[$measureCount + 1]) createMeasure(4.3, 0.5, $measures[$measureCount + 1]);
        
        $measureCount = $measureCount + 2;
    }
}



/************************************************************/
/*                 Output PDF Report                        */
/************************************************************/
$pdf->Output();



?>