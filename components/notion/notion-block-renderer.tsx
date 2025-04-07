import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import { Quote } from '../quote';
import { BlockValue, NotionListBlock, TransformedBlock } from '@/lib/notionApi';
import { isAllowedDomain } from '@/lib/utils';

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
    case 'image': {
      const src =
        value.type === 'external' && value.external?.url
          ? value.external.url
          : value.file?.url || '';
      return (
        <figure>
          <div className="overflow-hidden">
            {isAllowedDomain(src) ? (
              <Image
                className="w-full object-cover"
                src={src}
                alt={value.caption?.[0]?.plain_text || `image-${id}`}
                width={value.size?.width ?? 800}
                height={value.size?.height ?? 500}
                blurDataURL={value.placeholder}
                placeholder={value.placeholder ? 'blur' : 'empty'}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  margin: 0,
                  aspectRatio:
                    value.size?.width && value.size?.height
                      ? `${value.size.width} / ${value.size.height}`
                      : 'auto',
                }}
                priority={false}
              />
            ) : (
              <Image
                className="w-full object-cover"
                src={src}
                alt={value.caption?.[0]?.plain_text || `image-${id}`}
                width={value.size?.width ?? 800}
                height={value.size?.height ?? 500}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  margin: 0,
                  aspectRatio:
                    value.size?.width && value.size?.height
                      ? `${value.size.width} / ${value.size.height}`
                      : 'auto',
                }}
                unoptimized
              />
            )}
          </div>
          {value.caption?.[0]?.plain_text && (
            <figcaption className="text-center text-sm text-gray-500">
              {value.caption[0].plain_text}
            </figcaption>
          )}
        </figure>
      );
    }
    case 'video': {
      const src =
        value.type === 'external' && value.external?.url
          ? value.external.url
          : value.file?.url || '';

      // YouTube나 Vimeo 링크 처리
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        // Convert YouTube URL to embed URL if needed
        const youtubeSrc = src.replace(/watch\?v=(\w+)/, 'embed/$1');
        return (
          <figure className="my-4">
            <div className="aspect-video w-full">
              <iframe
                src={youtubeSrc}
                className="h-full w-full rounded-lg"
                title={value.caption?.[0]?.plain_text || `video-${id}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {value.caption?.[0]?.plain_text && (
              <figcaption className="text-center mt-2 text-sm text-gray-500">
                {value.caption[0].plain_text}
              </figcaption>
            )}
          </figure>
        );
      }

      return (
        <figure className="my-4">
          <video
            src={src}
            controls
            className="w-full rounded-lg"
            title={value.caption?.[0]?.plain_text || `video-${id}`}
          >
            Your browser does not support the video tag.
          </video>
          {value.caption?.[0]?.plain_text && (
            <figcaption className="text-center mt-2 text-sm text-gray-500">
              {value.caption[0].plain_text}
            </figcaption>
          )}
        </figure>
      );
    }
    case 'pdf': {
      const src =
        value.type === 'external' && value.external?.url
          ? value.external.url
          : value.file?.url || '';

      return (
        <figure className="my-4">
          <div className="aspect-video w-full">
            <iframe
              src={src}
              className="h-full w-full rounded-lg border-2"
              title={value.caption?.[0]?.plain_text || `pdf-${id}`}
            />
          </div>
          {value.caption?.[0]?.plain_text && (
            <figcaption className="text-center mt-2 text-sm text-gray-500">
              {value.caption[0].plain_text}
            </figcaption>
          )}
        </figure>
      );
    }
    case 'embed': {
      const src = value.url || '';

      return (
        <figure className="my-4">
          <div className="aspect-video w-full">
            <iframe
              src={src}
              className="h-full w-full rounded-lg border-2"
              title={`embed-${id}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {value.caption?.[0]?.plain_text && (
            <figcaption className="text-center mt-2 text-sm text-gray-500">
              {value.caption[0].plain_text}
            </figcaption>
          )}
        </figure>
      );
    }
    case 'callout': {
      return (
        <div className="flex items-start p-4 my-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="mr-4 text-xl">{value.icon?.emoji || '💡'}</div>
          <div>
            <NotionText textItems={value.rich_text} />
            {children?.length && (
              <div className="mt-2">
                {children.map((block) => (
                  <NotionBlockRenderer
                    key={block.id}
                    block={block as TransformedBlock}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'equation': {
      return (
        <div className="my-4 py-2 px-4 overflow-x-auto">
          {/* 여기에 KaTeX나 MathJax 같은 수식 렌더링 라이브러리를 사용할 수 있습니다 */}
          <div className="text-center font-mono">{value.expression}</div>
        </div>
      );
    }
    case 'table': {
      return (
        <div className="my-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <tbody>
              {value.children?.map((row: any, rowIndex) => (
                <tr
                  key={row.id}
                  className={
                    rowIndex % 2 === 0
                      ? 'bg-white dark:bg-gray-900'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }
                >
                  {row?.table_row?.cells?.map(
                    (cell: any[], cellIndex: number) => (
                      <td
                        key={`${row.id}-${cellIndex}`}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {cell.map((richText, rtIndex) => (
                          <span
                            key={`${row.id}-${cellIndex}-${rtIndex}`}
                            className={clsx({
                              'font-bold': richText.annotations?.bold,
                              italic: richText.annotations?.italic,
                              'line-through':
                                richText.annotations?.strikethrough,
                              underline: richText.annotations?.underline,
                            })}
                            style={
                              richText.annotations?.color !== 'default'
                                ? { color: richText.annotations?.color }
                                : {}
                            }
                          >
                            {richText.plain_text}
                          </span>
                        ))}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
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
    case 'link_preview':
      return (
        <div className="my-4 p-4 border rounded-lg">
          <a
            href={value.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col hover:underline"
          >
            <div className="font-medium">{value.url}</div>
            <div className="text-sm text-gray-500">링크 미리보기</div>
          </a>
        </div>
      );
    case 'audio':
      const audio_src =
        value.type === 'external' && value.external?.url
          ? value.external.url
          : value.file?.url || '';
      return (
        <figure className="my-4">
          <audio controls src={audio_src} className="w-full">
            Your browser does not support the audio element.
          </audio>
          {value.caption?.[0]?.plain_text && (
            <figcaption className="text-center mt-2 text-sm text-gray-500">
              {value.caption[0].plain_text}
            </figcaption>
          )}
        </figure>
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
