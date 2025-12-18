import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

const ArticleShareButtons = ({ title, slug }) => {
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/main-section/thoughts/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      label: '𝕏'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: 'f'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      label: 'in'
    },
    {
      name: 'SMS',
      url: `sms:?body=${encodedTitle}%20${encodedUrl}`,
      label: '💬'
    }
  ];

  return (
    <div className="share-container">
      <div className="share-header">
        <Share2 size={18} />
        <span>Share</span>
      </div>

      <div className="share-buttons">
        {/* Copy URL Button */}
        <button
          className="share-btn share-btn-copy"
          onClick={handleCopyUrl}
          title="Copy link"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Native Share (Mobile) */}
        {navigator.share && (
          <button
            className="share-btn share-btn-native"
            onClick={handleNativeShare}
            title="Share"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        )}

        {/* Social Share Buttons */}
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-btn-social"
            title={`Share on ${link.name}`}
          >
            <span className="share-icon">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ArticleShareButtons;
