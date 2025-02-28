import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import { Quote } from '../quote';
import { BlockValue, NotionListBlock, TransformedBlock } from '@/lib/notionApi';

type Props = {
  block: TransformedBlock;
};

export const NotionBlockRenderer = ({ block }: Props) => {
  const { type, id } = block;
  const value = ('type' in block && block[type]) as BlockValue;
  const children = value?.children;

  switch (type) {
    case 'paragraph':
      return (
        <div className="my-2">
          <NotionText textItems={value.rich_text} />
        </div>
      );
    case 'heading_1':
      return (
        <h1>
          <NotionText textItems={value.rich_text} />
        </h1>
      );
    case 'heading_2':
      return (
        <h2>
          <NotionText textItems={value.rich_text} />
        </h2>
      );
    case 'heading_3':
      return (
        <h3>
          <NotionText textItems={value.rich_text} />
        </h3>
      );
    case 'bulleted_list':
    case 'numbered_list':
      const listBlock = block as NotionListBlock;
      const listChildren = listBlock[type]?.children || [];
      return type === 'bulleted_list' ? (
        <ul className="list-disc pl-6">
          {listChildren.map((child) => (
            <NotionBlockRenderer
              key={child.id}
              block={child as TransformedBlock}
            />
          ))}
        </ul>
      ) : (
        <ol className="list-decimal pl-6">
          {listChildren.map((child) => (
            <NotionBlockRenderer
              key={child.id}
              block={child as TransformedBlock}
            />
          ))}
        </ol>
      );
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return (
        <li>
          <NotionText textItems={value.rich_text || []} />
          {children?.length ? (
            type === 'bulleted_list_item' ? (
              <ul className="list-disc pl-4">
                {children.map((block) => (
                  <NotionBlockRenderer
                    key={block.id}
                    block={block as TransformedBlock}
                  />
                ))}
              </ul>
            ) : (
              <ol className="list-decimal pl-4">
                {children.map((block) => (
                  <NotionBlockRenderer
                    key={block.id}
                    block={block as TransformedBlock}
                  />
                ))}
              </ol>
            )
          ) : null}
        </li>
      );
    case 'to_do':
      return (
        <div>
          <label htmlFor={id}>
            <input type="checkbox" id={id} defaultChecked={value.checked} />{' '}
            <NotionText textItems={value.rich_text} />
          </label>
        </div>
      );
    case 'toggle':
      return (
        <details>
          <summary>
            <NotionText textItems={value.rich_text} />
          </summary>
          {value.children?.map((block: any) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}
        </details>
      );
    case 'child_page':
      return <p>{value.title}</p>;
    case 'image':
      const src =
        value.type === 'external' && value.external?.url
          ? value.external.url
          : value.file?.url || '';
      return (
        <figure>
          <Image
            className="object-cover"
            placeholder="blur"
            src={src}
            alt={value.caption?.[0]?.plain_text || `image-${id}`}
            blurDataURL={value.placeholder}
            width={value.size?.width ?? 0}
            height={value.size?.height ?? 0}
          />
          {value.caption?.[0]?.plain_text && (
            <figcaption>{value.caption[0].plain_text}</figcaption>
          )}
        </figure>
      );
    case 'divider':
      return <hr key={id} />;
    case 'quote':
      return value.rich_text?.[0]?.plain_text ? (
        <Quote key={id} quote={value.rich_text[0].plain_text} />
      ) : null;
    case 'code':
      return value.rich_text?.[0]?.plain_text ? (
        <pre className={`language-${value.language}`}>
          <code key={id}>{value.rich_text[0].plain_text}</code>
        </pre>
      ) : null;
    case 'file':
      const src_file =
        value.type === 'external' && value.external?.url
          ? value.external.url
          : value.file?.url || '';
      const splitSourceArray = src_file.split('/');
      const lastElementInArray = splitSourceArray[splitSourceArray.length - 1];
      const caption_file = value.caption ? value.caption[0]?.plain_text : '';
      return (
        <figure>
          <div>
            📎{' '}
            <Link href={src_file} passHref>
              {lastElementInArray.split('?')[0]}
            </Link>
          </div>
          {caption_file && <figcaption>{caption_file}</figcaption>}
        </figure>
      );
    case 'bookmark':
      const href = value.url;
      return (
        <a href={href} target="_brank">
          {href}
        </a>
      );
    default:
      return (
        <>
          ❌ Unsupported block ($
          {type === 'unsupported' ? 'unsupported by Notion API' : type})
        </>
      );
  }
};

const NotionText = ({ textItems }: { textItems?: RichTextItemResponse[] }) => {
  if (!textItems?.length) {
    return null;
  }

  return (
    <>
      {textItems.map((textItem, idx) => {
        if (!('text' in textItem)) return null;

        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text,
        } = textItem;
        return (
          <span
            key={`${text?.content}-${idx}`}
            className={clsx('inline', {
              'font-bold': bold,
              'font-mono font-semibold bg-zinc-600 text-zinc-200 px-1 py-0.5 m-1 rounded-md':
                code,
              italic: italic,
              'line-through': strikethrough,
              underline: underline,
            })}
            style={color !== 'default' ? { color } : {}}
          >
            {text?.link ? (
              <a href={text?.link.url}>{text?.content}</a>
            ) : (
              text?.content
            )}
          </span>
        );
      })}
    </>
  );
};
