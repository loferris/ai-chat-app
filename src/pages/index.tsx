import React from 'react';
import { Chat } from '../components/chat/Chat';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100'>
      <Chat />
    </div>
  );
}
