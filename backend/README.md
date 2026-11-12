# Backend

The backend is implemented as Next.js API routes in `frontend/app/api` with layers in `frontend/lib`.
Routes call controllers, controllers check auth and call services, services run SQL/Mongo queries.
See `documentation/` for architecture details.
