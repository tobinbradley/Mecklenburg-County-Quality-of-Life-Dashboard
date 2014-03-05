<?php

// grab json
$string = file_get_contents("metrics.json");
$json = json_decode($string, true);

// connect to database
$conn = new PDO ("pgsql:host=meckgisdbopen;dbname=GISData;port=5432","postgrereader","postgrereader", array(PDO::ATTR_PERSISTENT => true));

// loop and export
foreach ($json as $item) {
    $short = $item['field'];
    $field = $item['db'];

    $sql = "select
            id, $field as y_2010,
            $field + ($field * sin(random() * (2*pi()) ) * 0.3)::integer as y_2012
            from view_neighborhoods
            order by id";

    $statement=$conn->prepare( $sql );
    $statement->execute();

    $filename = 'tmp/' . $short . '.csv';

    $data = fopen($filename, 'w');

    fputcsv($data, array('id', 'y_2010', 'y_2012'));
    while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($data, $row);
    }

    fclose($data);
}

?>
