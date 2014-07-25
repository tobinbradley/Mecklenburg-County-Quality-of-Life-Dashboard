copy
(select objectid as id,
  sum(case when extract(year from "Date") = 2011 then 1 else 0 end) as y_2011,
  sum(case when extract(year from "Date") = 2012 then 1 else 0 end) as y_2012,
  sum(case when extract(year from "Date") = 2013 then 1 else 0 end) as y_2013,
  sum(case when extract(year from "Date") = 2014 then 1 else 0 end) as y_2014
  from "voting-precincts" v inner join buildingpermits c ON(st_contains(v.geom, c.geom))
  group by objectid
  order by objectid
) TO STDOUT WITH CSV HEADER;
