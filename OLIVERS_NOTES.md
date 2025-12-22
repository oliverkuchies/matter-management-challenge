My Notes
- I refactored the repos to use a base repo. Here we can place any repetitive logic, such as transaction wrapping. I will also strive to add row counts, or row retrieval here too for simplicity.
  - At times using ORM's can improve the experience of above ^, but with ORM's building queries can be tricky as you are bound by the constraints of the abstractions.
- Docker compose automatically uses .env, so I moved env declarations out of docker and isolated them in .env.example (which can be copied to .env).
- Updated docker-compose instructions, in my opinion deattached mode makes more sense for engineers.
- Added barrelling for UI components. (i.e. export * from './blah'). When scaling UI systems, this can cause performance issues - but for small UI Kits it can be quite clean for managing UIs.
- Added the option to change the status, for the sake of better testing. 
- Refactored Postgres usages to use base repository methods for row selection. Previous implementation was not Typesafe and allowed for any[] to be returned.
    - After making this one change, many type errors appeared which indicates that typing was not performed properly (we ripped a bandaid off.) :smile:
- Removed typecasting, which is another code smell (as it hides root issues with Typescript used incorrectly)
- Added React Query for easier updating & retrieval of content. This means that state is managed more on the backend than the frontend, allowing for fresh data when a user sees the page. For instance, if two legal team members are updating the page at once, it would be helpful for latest data to be presented to the other user. Tanstack allows for this using refetching
- Updated lint rules (including prettier.)


AI Usage
Where I did NOT use AI:
- Algorithms
- Query building


Where I did use AI:
- Created StatusCell with AI, but created auto tests on my own to make sure it meets the necessary criteria. Also ensured it meeted expected standards i.e. Tailwind etc. Noticed dropdown was displaying in a broken fashion, added flex, and flex-col to organise it in the correct manner.
- Utilised for refactoring. I created the repository base methods, but refactored the existing repos to use them.
- Refactoring inline objects as interfaces.
- Created core scaffolding for tests, but tweaked them myself to prevent dodgy llm patterns (and also add more cases.)
- Optimising existing queries
  - When building the multi join query to determine the diff between JOINS i realised that ADVANCED sql could be used to retrieve a diff value. I utilise LLMs to develop this, and validated the logic. As a result, it resulted in 66% reduction in time taken due to less joins.
- Used it to create components like Search Bar, but spent a lot of time afterward cleaning up issues such as poor presentational separation of concerns, and also addressing losing focus upon state change. I fixed this by decoupling searchbar from mattertable.
## TODO
Setup caching.
Encapsulate caching.
Implement versioning & invalidation.


## DB Optimisation.

When running EXPLAIN ANALYZE on my query, i received the following result:
```Sort  (cost=37.79..37.80 rows=2 width=1088) (actual time=0.474..0.482 rows=71 loops=1)
  Sort Key: th.transitioned_at
  Sort Method: quicksort  Memory: 33kB
  ->  Nested Loop Left Join  (cost=23.99..37.78 rows=2 width=1088) (actual time=0.218..0.427 rows=71 loops=1)
        ->  Nested Loop Left Join  (cost=23.84..36.65 rows=2 width=588) (actual time=0.205..0.327 rows=71 loops=1)
              ->  Hash Right Join  (cost=23.70..35.52 rows=2 width=88) (actual time=0.186..0.211 rows=71 loops=1)
                    Hash Cond: (tfso_to.id = th.to_status_id)
                    ->  Seq Scan on ticketing_field_status_options tfso_to  (cost=0.00..11.20 rows=120 width=32) (actual time=0.003..0.004 rows=3 loops=1)
                    ->  Hash  (cost=23.67..23.67 rows=2 width=72) (actual time=0.170..0.173 rows=71 loops=1)
                          Buckets: 1024  Batches: 1  Memory Usage: 16kB
                          ->  Hash Right Join  (cost=11.86..23.67 rows=2 width=72) (actual time=0.118..0.140 rows=71 loops=1)
                                Hash Cond: (tfso_from.id = th.from_status_id)
                                ->  Seq Scan on ticketing_field_status_options tfso_from  (cost=0.00..11.20 rows=120 width=32) (actual time=0.006..0.007 rows=3 loops=1)
                                ->  Hash  (cost=11.84..11.84 rows=2 width=56) (actual time=0.100..0.101 rows=71 loops=1)
                                      Buckets: 1024  Batches: 1  Memory Usage: 15kB
                                      ->  Bitmap Heap Scan on ticketing_cycle_time_histories th  (cost=4.30..11.84 rows=2 width=56) (actual time=0.053..0.077 rows=71 loops=1)
                                            Recheck Cond: (ticket_id = '5c9d8b7e-c3d6-446d-8af5-00b27ed03ca9'::uuid)
                                            Heap Blocks: exact=3
                                            ->  Bitmap Index Scan on idx_cycle_time_histories_ticket_id  (cost=0.00..4.30 rows=2 width=0) (actual time=0.039..0.040 rows=71 loops=1)
                                                  Index Cond: (ticket_id = '5c9d8b7e-c3d6-446d-8af5-00b27ed03ca9'::uuid)
              ->  Index Scan using ticketing_field_status_groups_pkey on ticketing_field_status_groups tfsg_from  (cost=0.14..0.56 rows=1 width=532) (actual time=0.001..0.001 rows=1 loops=71)
                    Index Cond: (id = tfso_from.group_id)
        ->  Index Scan using ticketing_field_status_groups_pkey on ticketing_field_status_groups tfsg_to  (cost=0.14..0.56 rows=1 width=532) (actual time=0.001..0.001 rows=1 loops=71)
              Index Cond: (id = tfso_to.group_id)
Planning Time: 0.648 ms
Execution Time: 0.650 ms
```

Based on the above, I noticed:
1) Ticket_id is working well as an index in ticket_cycle_time_histories
2) Indexes for ticketing_field_status_options.from_status_id, and ticketing_field_status_options.to_status_id are missing, along with ticketing_field_status_groups.group_id
3) transitioned_at is also missing an index. It is being used for sorting.

After applying those changes, the query speed was improved by 12%.

# Matter Repo Field Retrieval Optimisation

As it stands, the matter field retrieval was suboptimal.
If there were 100 matters pulled at once, it meant that a field query would need to be executed for each of those matters. Think o(n) where n is 100.

Now its o(1), where 1 is the matter id.

Now its using ANY($1) (which is something like IN(x,y,z) in MySQL), which retrieves all items with given ids at once.

# UI Optimisation
Cleaned up matter table, it was quite repetitive (hard coded). I used a loop to traverse all items instead and display them such as th, and td.

- Moved thead away from tbody so that thead is loaded all the time, regardless of state.

# Search Optimisation
- Added Search using a materialised view, which is a lot more friendly with EAV (due to complexity of joins and cases).
- This is my first time playing around with search in postgres, but basically the materialised view will collate a collection of searchable vectors using to_tsvector which transforms regular text into a seachable format.
- I started using EAV with in memory sort, but realised that once the material view was in place, i was able to utilise sort there really easily (by adding more cols).
 
 i.e. 
'The quick brown fox jumps over the lazy dog' becomes
'brown':3 'dog':9 'fox':4 'jump':5 'lazi':8 'quick':2

The search columns allow for easy searches. A sample query is as follows:

SELECT * FROM ticket_search_index 
WHERE search_vector @@ plainto_tsquery('english', 'search term')
ORDER BY created_at DESC
LIMIT 25 OFFSET 0;

Supposedly EAV in general is an anti-pattern and not recommended, but if we were to add a layer on top of this for scale we could use Elastic Search (perhaps with Postgres sync). 


## Assumptions
-> When a ticket has progressed, but then moved back to todo -> it is still prefixed with In Progress:
-> When a ticket has not progressed, and has no time associated with it, it returns '-'