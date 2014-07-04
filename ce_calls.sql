copy
(select objectid as id,
  sum(case when extract(year from dateopened) = 2011 then 1 else 0 end) as y_2011,
  sum(case when extract(year from dateopened) = 2012 then 1 else 0 end) as y_2012,
  sum(case when extract(year from dateopened) = 2013 then 1 else 0 end) as y_2013,
  sum(case when extract(year from dateopened) = 2014 then 1 else 0 end) as y_2014
  from votingprecinct v left join ce_calls c ON(st_contains(v.geom, c.geom) AND casetype = 'Housing')
  group by objectid
  order by id
) TO STDOUT WITH CSV HEADER;

