import React, { useState, useEffect, useRef } from 'react';

const ProductPopup = ({ product, user, reviews, messages, onClose, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  // Filter reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);

  // Filter messages for this product, buyer, and farmer
  const productMessages = messages.filter((m) => {
    const matchesProduct = m.productId === product.id;
    if (!user) return false;
    
    const userId = user.userId || user.email || user.id;
    const farmerId = product.farmerId || product.ownerId || '';
    
    // Show messages where user is buyer or farmer for this product
    return matchesProduct && (
      m.buyerId === userId || 
      m.farmerId === userId ||
      m.fromUserId === userId ||
      m.toUserId === userId
    );
  }).sort((a, b) => (a.timestamp || a.createdAt || 0) - (b.timestamp || b.createdAt || 0));

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeTab === 'messages' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [productMessages, activeTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;

    const userId = user.userId || user.email || user.id;
    const farmerId = product.farmerId || product.ownerId || '';
    const farmerName = product.farmerName || product.ownerName || 'Unknown';

    onSendMessage({
      messageId: Date.now().toString(),
      buyerId: userId,
      buyerName: user.name,
      farmerId: farmerId,
      farmerName: farmerName,
      productId: product.id,
      productName: product.name,
      content: messageText.trim(),
      timestamp: Date.now(),
      // Backward compatibility
      fromUserId: userId,
      fromUserName: user.name,
      toUserId: farmerId,
      body: messageText.trim(),
      senderRole: 'buyer'
    });

    setMessageText('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          ×
        </button>

        {/* Header */}
        <h3 style={{ 
          marginBottom: '20px', 
          color: '#333',
          fontSize: '20px',
          fontWeight: '600',
          paddingRight: '40px'
        }}>
          {product.name}
        </h3>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '2px solid #e1e5e9'
        }}>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'reviews' ? '2px solid #5eed3a' : '2px solid transparent',
              color: activeTab === 'reviews' ? '#5eed3a' : '#666',
              fontSize: '14px',
              fontWeight: activeTab === 'reviews' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-2px'
            }}
          >
            Reviews
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'messages' ? '2px solid #5eed3a' : '2px solid transparent',
              color: activeTab === 'messages' ? '#5eed3a' : '#666',
              fontSize: '14px',
              fontWeight: activeTab === 'messages' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-2px'
            }}
          >
            Messages
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: '200px',
          maxHeight: '400px'
        }}>
          {activeTab === 'reviews' && (
            <div>
              {productReviews.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  No reviews yet for this product.
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {productReviews.map((review) => (
                    <div key={review.id} style={{
                      background: '#f9f9f9',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e1e5e9'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: '#333',
                          fontSize: '14px'
                        }}>
                          {review.buyerName || 'Anonymous'}
                        </span>
                        <span style={{
                          color: '#ffd700',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        color: '#555',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {review.comment}
                      </p>
                      {review.createdAt && (
                        <div style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#999'
                        }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {productMessages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <>
                  {productMessages.map((msg) => {
                    const userId = user?.userId || user?.email || user?.id;
                    // Check if message was sent by current user (buyer)
                    // Message is from buyer if: senderRole is 'buyer' OR fromUserId matches current user
                    const isSentByCurrentUser = msg.senderRole === 'buyer' || 
                                                msg.fromUserId === userId || 
                                                (msg.buyerId === userId && msg.senderRole !== 'farmer');
                    
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: isSentByCurrentUser ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: isSentByCurrentUser ? '#5eed3a' : '#f0f0f0',
                          color: isSentByCurrentUser ? 'black' : '#333',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}>
                          <div style={{
                            fontWeight: '600',
                            marginBottom: '4px',
                            fontSize: '12px',
                            opacity: 0.8
                          }}>
                            {isSentByCurrentUser ? 'You' : (msg.farmerName || product.farmerName || product.ownerName || 'Farmer')}
                          </div>
                          <div>{msg.content || msg.body}</div>
                          <div style={{
                            fontSize: '11px',
                            marginTop: '4px',
                            opacity: 0.7
                          }}>
                            {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Message Input (only show in Messages tab) */}
        {activeTab === 'messages' && user && (
          <form onSubmit={handleSendMessage} style={{
            marginTop: '16px',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '8px',
                border: '2px solid #e1e5e9',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              style={{
                padding: '10px 20px',
                background: messageText.trim() ? '#5eed3a' : '#ccc',
                color: messageText.trim() ? 'black' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (messageText.trim()) {
                  e.target.style.background = '#4ddb2a';
                }
              }}
              onMouseLeave={(e) => {
                if (messageText.trim()) {
                  e.target.style.background = '#5eed3a';
                }
              }}
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductPopup;

