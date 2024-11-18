import React, { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Import the plugin
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math'; // Import remark-math
import './MessageFormatter.css';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// Memoized ChartRenderer component to avoid re-renders on same chartConfig
const ChartRenderer = React.memo(({ chartConfig }) => {
  const { type, data, options } = chartConfig;

  switch (type) {
    case 'bar':
      return <Bar data={data} options={options} />;
    case 'line':
      return <Line data={data} options={options} />;
    case 'pie':
      return <Pie data={data} options={options} />;
    case 'doughnut':
      return <Doughnut data={data} options={options} />;
    case 'radar':
      return <Radar data={data} options={options} />;
    default:
      return <p>Unsupported chart type: {type}</p>;
  }
});

// Main component to render the message content
const MessageFormatter = React.memo(({ message }) => {

  // Memoized function to check if JSON data is a valid Chart.js configuration
  const isChartConfig = useMemo(() => (jsonData) => {
    return (
      jsonData &&
      typeof jsonData.type === 'string' &&
      jsonData.data &&
      jsonData.data.datasets &&
      Array.isArray(jsonData.data.datasets)
    );
  }, []);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isJson = match && match[1] === 'json';

          if (!inline && isJson) {
            try {
              const jsonData = JSON.parse(children);

              if (isChartConfig(jsonData)) {
                return <ChartRenderer chartConfig={jsonData} />;
              }
            } catch (error) {
              console.error('Invalid JSON:', error);
              return <p>Error: Invalid JSON chart configuration.</p>;
            }
          }

          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {message.content}
    </ReactMarkdown>
  );
});

export default MessageFormatter;