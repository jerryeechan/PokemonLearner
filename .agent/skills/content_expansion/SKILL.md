---
name: Pokemon Content Expansion
description: Automates the process of generating new Pokemon vocabulary batches and reading the progress plan.
---

# Pokemon Content Expansion Skill

When the user requests to "expand content", "generate new vocabulary", "run the next batch", or anything related to adding new Pokemon vocabulary to the game, you MUST follow these steps:

1. **Read the Plan & Progress**
   Always begin by reading the file `docs/content_generation_plan.md` using the `view_file` tool.
   Look specifically at **Section 7: 目前擴充進度追蹤 (Progress Tracker)** to determine which Batch we are currently working on.

2. **Understand the Strategy**
   Review **Section 3** of the same document to understand the context of the batch (Location, Characters, expected vocabulary themes).
   For early chapters (Batches 01 to 05), remember the strategy is to expand vocabulary by 2-3x, focusing heavily on everyday basic Japanese words and conversational phrases, not just Pokemon terminology.

3. **Check for existing Raw Texts**
   Check if a text file exists in `scripts/raw_texts/` for the current batch (e.g., `batch_02_viridian_city.txt`).
   If the file doesn't exist, proceed by generating the vocabulary using your own LLM knowledge of that specific Pokemon FireRed/LeafGreen chapter.

4. **Generate the Review JSON**
   Generate a JSON artifact named `batch_XX_review.json` (where XX is the batch number).
   Ensure the JSON strictly follows the `VocabEntry` interface format (requires id, category, japanese, hiragana, romaji, zh_tw, difficulty, frequency, explanation, etymology, example_sentence, example_sentence_zh,example_sentence_explanation).
   Leave ID as empty string `""` or `"AUTO"` to let the merge script handle the sequential numbering.
   Ask the user to review this JSON artifact before proceeding.

5. **Merge the Data**
   After user approval, run `npx tsx scripts/_merge_batch.ts` (ensure the script points to your newly generated review JSON or update the script path temporarily).
   Then, importantly, compile everything by running `npx tsx scripts/generate_vocab.ts`. Check for any duplication errors and fix `scripts/data/*.ts` if necessary.

6. **Update the Chapter**
   View the tail of the `scripts/data/dialogue.ts`, `locations.ts`, and `pokemon.ts` files to get the newly generated IDs.
   Update `src/data/chapters.ts` to add or update the corresponding chapter object, linking the new `vocabIds`.

7. **Track Progress**
   Finally, update the checklists in both the project's `docs/content_generation_plan.md` and your internal `task.md` to mark the batch as complete.

By following this skill, we ensure the project scales smoothly batch by batch.
