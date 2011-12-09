<?php

// FPDF
require('fpdf17/fpdf.php');

// Get neighborhood
//$neighborhood = $_REQUEST['n'];
$neighborhood = 450;


class PDF extends FPDF
{

// Page footer
function Footer()
{
    // Position at 1.5 cm from bottom
    $this->SetY(-0.5);
    // Arial italic 8
    $this->SetFont('Arial','I',8);
    // Page number
    $this->Cell(0,0,'Quality of Life Dashboard - http://maps.co.mecklenburg.nc.us/qoldashboard/',0,0,'C');
}
}


// Create PDF
$pdf = new PDF('P','in','Letter');

/**
 *  Add PDF Content
 */
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

// Output PDF
$pdf->Output();

?>