My Notes
- I refactored the repos to use a base repo. Here we can place any repetitive logic, such as transaction wrapping. I will also strive to add row counts, or row retrieval here too for simplicity.
  - At times using ORM's can improve the experience of above ^, but with ORM's building queries can be tricky as you are bound by the constraints of the abstractions.
- Docker compose automatically uses .env, so I moved env declarations out of docker and isolated them in .env.example (which can be copied to .env).
- I added storybook, it makes live a lot easier with mock data! It also means that FE and BE work can be isolated, allowing the two domains to operate separately in the business.
- Updated docker-compose instructions, in my opinion deattached mode makes more sense for engineers.
- Added barrelling for UI components. (i.e. export * from './blah'). When scaling UI systems, this can cause performance issues - but for small UI Kits it can be quite clean for managing UIs.
- Added the option to change the status, for the sake of better testing. 
- Refactored Postgres usages to use base repository methods for row selection. Previous implementation was not Typesafe and allowed for any[] to be returned.
    - After making this one change, many type errors appeared which indicates that typing was not performed properly (we ripped a bandaid off.) :smile:
- Removed typecasting, which is another code smell (as it hides root issues with Typescript used incorrectly)
- Added React Query for easier updating & retrieval of content. This means that state is managed more on the backend than the frontend, allowing for fresh data when a user sees the page. For instance, if two legal team members are updating the page at once, it would be helpful for latest data to be presented to the other user. Tanstack allows for this using refetching
- Updated lint rules (including prettier.)
- 

AI Usage
Where I did NOT use AI:
- Algorithms
- Query building


Where I did use AI:
- Used AI to create Storybook components for Matter table and Pagination. This will be easier for me to test transitions without mutating the sample data.
- Created StatusCell with AI, but created auto tests on my own to make sure it meets the necessary criteria. Also ensured it meeted expected standards i.e. Tailwind etc. Noticed dropdown was displaying in a broken fashion, added flex, and flex-col to organise it in the correct manner.
- Utilised for refactoring. I created the repository base methods, but refactored the existing repos to use them.
- Refactoring inline objects as interfaces.
- Created core scaffolding for tests, but tweaked them myself to prevent dodgy llm patterns (and also add more cases.)

TODO
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