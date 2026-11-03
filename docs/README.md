# Database design documentation

- `relational-schema-final.md` — final 14-table relational schema.
- `schema-review-final.md` — approved design decisions, rationale and implementation cautions.
- `chen-er-diagram-final.dot` — editable Chen ER diagram source (entity rectangles, relationship diamonds, attribute ovals; primary keys underlined).

The rendered Chen diagram is included in the downloadable finalized design package. To render the source locally:

```bash
dot -Tpng docs/chen-er-diagram-final.dot -o docs/chen-er-diagram-final.png
dot -Tpdf docs/chen-er-diagram-final.dot -o docs/chen-er-diagram-final.pdf
```

The target model is PostgreSQL-oriented. The prototype SQL is not the final schema; implementation and database integrity tests are the next milestone.
