This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supported Blocks

The majority of Notion blocks and collection views are fully supported.

| Block Type               | Supported | Block Type Enum        | Notes                                                                                                            |
| ------------------------ | :-------: | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Page                     |    ❌     | `page`                 |
| Text                     |    ❌     | `text`                 | Supports all known text formatting options                                                                       |
| Bookmark                 |    ❌     | `bookmark`             | Embedded preview of external URL                                                                                 |
| Bulleted List            |    ❌     | `bulleted_list`        | `<ul>`                                                                                                           |
| Numbered List            |    ❌     | `numbered_list`        | `<ol>`                                                                                                           |
| Heading 1                |    ❌     | `header`               | `<h1>`                                                                                                           |
| Heading 2                |    ❌     | `sub_header`           | `<h2>`                                                                                                           |
| Heading 3                |    ❌     | `sub_sub_header`       | `<h3>`                                                                                                           |
| Quote                    |    ❌     | `quote`                |
| Callout                  |    ❌     | `callout`              |
| Equation (block)         |    ❌     | `equation`             | [katex](https://katex.org/) via [react-katex](https://github.com/MatejBransky/react-katex)                       |
| Equation (inline)        |    ❌     | `text`                 | [katex](https://katex.org/) via [react-katex](https://github.com/MatejBransky/react-katex)                       |
| Todos (checkboxes)       |    ❌     | `to_do`                |
| Table Of Contents        |    ❌     | `table_of_contents`    | See `notion-utils` `getPageTableOfContents` helper funtion                                                       |
| Divider                  |    ❌     | `divider`              | Horizontal line                                                                                                  |
| Column                   |    ❌     | `column`               |
| Column List              |    ❌     | `column_list`          |
| Toggle                   |    ❌     | `toggle`               | [`<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details)                                 |
| Image                    |    ❌     | `image`                | `<img>`                                                                                                          |
| Embed                    |    ❌     | `embed`                | Generic `iframe` embeds                                                                                          |
| Video                    |    ❌     | `video`                | `iframe`                                                                                                         |
| Figma                    |    ❌     | `figma`                | `iframe`                                                                                                         |
| Google Maps              |    ❌     | `maps`                 | `iframe`                                                                                                         |
| Google Drive             |    ❌     | `drive`                | Google Docs, Sheets, etc custom embed                                                                            |
| Tweet                    |    ❌     | `tweet`                | Uses the twitter embedding SDK                                                                                   |
| PDF                      |    ❌     | `pdf`                  | Uses S3 signed URLs and [react-pdf](https://github.com/wojtekmaj/react-pdf)                                      |
| Audio                    |    ❌     | `audio`                | Uses S3 signed URLs and [HTML5 `audio` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) |
| File                     |    ❌     | `file`                 | Uses S3 signed URLs (generic downloadable file)                                                                  |
| Link                     |    ❌     | `text`                 | External links                                                                                                   |
| Page Link                |    ❌     | `page`                 | Link to a notion page in the same workspace                                                                      |
| External Page Link       |    ❌     | `text`                 | Links to a notion page or collection view in another workspace                                                   |
| Code (block)             |    ❌     | `code`                 | Block code syntax highlighting via [prismjs](https://prismjs.com/)                                               |
| Code (inline)            |    ❌     | `text`                 | Inline code formatting (no syntax highlighting)                                                                  |
| Collections              |    ❌     |                        | Also known as [databases](https://www.notion.so/Intro-to-databases-fd8cd2d212f74c50954c11086d85997e)             |
| Collection View          |    ❌     | `collection_view`      | Collections have a 1:N mapping to collection views                                                               |
| Collection View Table    |    ❌     | `collection_view`      | `type = "table"` (default table view)                                                                            |
| Collection View Gallery  |    ❌     | `collection_view`      | `type = "gallery"` (grid view)                                                                                   |
| Collection View Board    |    ❌     | `collection_view`      | `type = "board"` (kanban view)                                                                                   |
| Collection View List     |    ❌     | `collection_view`      | `type = "list"` (vertical list view)                                                                             |
| Collection View Calendar |    ❌     | `collection_view`      | `type = "calendar"` (embedded calendar view)                                                                     |
| Collection View Page     |    ❌     | `collection_view_page` | Collection view as a standalone page                                                                             |
