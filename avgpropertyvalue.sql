copy
(select objectid as id,
  (sum(case when c.taxyr = 2011 then c.taxablevalue else 0 end) / sum(case when c.taxyr = 2011 then 1 else 0 end)) as y_2011,
  (sum(case when c.taxyr = 2012 then c.taxablevalue else 0 end) / sum(case when c.taxyr = 2012 then 1 else 0 end)) as y_2012,
  (sum(case when c.taxyr = 2013 then c.taxablevalue else 0 end) / sum(case when c.taxyr = 2013 then 1 else 0 end)) as y_2013,
  (sum(case when c.taxyr = 2014 then c.taxablevalue else 0 end) / sum(case when c.taxyr = 2014 then 1 else 0 end)) as y_2014
  from "voting-precincts" v left join propertyvaluegeo c ON(st_contains(v.geom, c.geom))
  group by objectid
  order by id
) TO STDOUT WITH CSV HEADER;

