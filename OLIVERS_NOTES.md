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