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

/**
 * Get form variables
 */
$neighborhood = $_REQUEST['n'];
$measures = explode(",", urldecode($_REQUEST['m']));


/**
 * Load data JSON
 */
$string = file_get_contents("../js/metrics.json");
$json = json_decode($string, true);

 
/**
 * Load neighborhood information from Google Fusion Tables
 */
if (strlen(urldecode($_REQUEST['m'])) > 0) {
    // neighborhood    
    $ft = new googleFusion();
    $gft_neighborhood = $ft->query("select " . $_REQUEST['m'] . " FROM " . $tableID . " WHERE ID = " . $neighborhood);
    
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
$pdf->SetFont('Arial','B',64);
$pdf->Ln(0.8);
$pdf->Cell(0.3);
$pdf->Cell(0,0, "Neighborhood");

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
$final_extent =  str_replace($ditch, $replace,$extentJSON[rows][0][row][extent]);

// Put map image (WMS) on page
$mapURL = "http://maps.co.mecklenburg.nc.us/geoserver/wms/reflect?layers=meckbase,neighborhoods&width=800&bbox=" . $final_extent . "&srs=EPSG:2264&CQL_FILTER=include;id=" . $neighborhood;
 $pdf->Image($mapURL,0.3,0.3,7.9, 10, "PNG");



/************************************************************/
/*                 Create Measure Function                           */
/************************************************************/
function createMeasure($x, $y, $themeasure) {

    global $pdf, $json, $gft_neighborhood, $gft_average;
    
    $pdf->SetTextColor(0,0,0);    
    $pdf->SetY($y);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',12);    
    $pdf->Write(0, ucwords($json[$themeasure][category]) . ": " . $json[$themeasure][title]);
    $pdf->Ln(0.2);
    $pdf->SetX($x);
    $pdf->Image( "http://chart.apis.google.com/chart?chxr=0,0,100&chxl=1:|2010&chxt=x,y&chbh=a,4,9&chs=250x75&cht=bhg&chco=4D89F9,C6D9FD&chds=0,100,0,100&chd=t:" . $gft_neighborhood[0][$json[$themeasure]["field"]] . "|" . round($gft_average[0][$json[$themeasure]["field"]]) . "&chdl=Neightborhood|County+Average&chdlp=t&chg=-1,0", null , null, 0, 0, "PNG");
    $pdf->Ln(0.2);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','B',10);
    $pdf->Write(0, "What is this Indicator?");
    $pdf->Ln(0.1);
    $pdf->SetX($x);
    $pdf->SetFont('Arial','',10);
    $pdf->MultiCell(3.5, 0.15, $json[$themeasure][description], 0, "L");
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
    for ($i=0; $i < ceil(count($measures) / 4); $i++) {
        // add page    
        $pdf->AddPage();
        
        if ($measures[ $measureCount]) createMeasure(0.5, 0.5, $measures[$measureCount]);
        if ($measures[$measureCount + 1]) createMeasure(4.3, 0.5, $measures[$measureCount + 1]);
        if ($measures[$measureCount + 2]) createMeasure(0.5, 5.8, $measures[$measureCount + 2]);
        if ($measures[$measureCount + 3]) createMeasure(4.3, 5.8, $measures[$measureCount + 3]);
        
        $measureCount = $measureCount + 4;
    }
}



/************************************************************/
/*                 Output PDF Report                        */
/************************************************************/
$pdf->Output();



?>