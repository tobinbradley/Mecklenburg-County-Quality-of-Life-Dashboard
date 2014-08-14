copy
(select objectid as id,
  sum(case when extract(year from saledate) = 2011 then 1 else 0 end) as y_2011,
  sum(case when extract(year from saledate) = 2012 then 1 else 0 end) as y_2012,
  sum(case when extract(year from saledate) = 2013 then 1 else 0 end) as y_2013,
  sum(case when extract(year from saledate) = 2014 then 1 else 0 end) as y_2014
  from "voting-precincts" v left join foreclosuresgeo c ON(st_contains(v.geom, c.geom))
  group by objectid
  order by id
) TO STDOUT WITH CSV HEADER;

