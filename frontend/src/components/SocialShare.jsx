import React, { useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon
} from 'react-share';
import { FiShare2, FiLink, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import './SocialShare.css';

const SocialShare = ({ url, title, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
    setIsOpen(false);
  };

  return (
    <div className="social-share">
      <button 
        className="share-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Share this event"
      >
        <FiShare2 />
      </button>

      {isOpen && (
        <div className="share-panel">
          <div className="share-header">
            <h3>Share this event</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <FiX />
            </button>
          </div>

          <div className="share-buttons">
            <FacebookShareButton
              url={url}
              quote={title}
              description={description}
              className="share-button facebook"
            >
              <FacebookIcon size={40} round />
            </FacebookShareButton>

            <TwitterShareButton
              url={url}
              title={title}
              className="share-button twitter"
            >
              <TwitterIcon size={40} round />
            </TwitterShareButton>

            <LinkedinShareButton
              url={url}
              title={title}
              summary={description}
              className="share-button linkedin"
            >
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>

            <WhatsappShareButton
              url={url}
              title={title}
              className="share-button whatsapp"
            >
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>

            <EmailShareButton
              url={url}
              subject={title}
              body={description}
              className="share-button email"
            >
              <EmailIcon size={40} round />
            </EmailShareButton>

            <button onClick={copyToClipboard} className="share-button copy-link">
              <div className="custom-icon">
                <FiLink />
              </div>
            </button>
          </div>

          <div className="share-url">
            <input type="text" value={url} readOnly />
            <button onClick={copyToClipboard} className="copy-btn">
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialShare;