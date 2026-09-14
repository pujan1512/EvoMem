import React from 'react';

export default function TechStackBadges({ stack = ['React', 'Node.js', 'Express.js', 'MySQL', 'AI/ML'] }) {
  const getTagClass = (idx) => {
    const classes = ['tech-tag-1', 'tech-tag-2', 'tech-tag-3', 'tech-tag-4', 'tech-tag-5'];
    return classes[idx % classes.length];
  };

  return (
    <div className="tech-tag-group">
      {stack.map((item, idx) => (
        <span key={idx} className={getTagClass(idx)}>
          {item}
        </span>
      ))}
    </div>
  );
}
