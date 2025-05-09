import { Box } from '@mui/material';
import React from 'react';
import { RandomPost } from '@helpers/types/api';
import PostCard from './Post';

const samplePosts: RandomPost[] = [
  {
    id: '1',
    image: 'https://source.unsplash.com/featured/?running',
    likes: 120,
    text: 'Morning tempo session!',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner1',
      title: 'mr',
      firstName: 'Alex',
      lastName: 'R',
      picture: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
  },
  {
    id: '2',
    image: 'https://source.unsplash.com/featured/?marathon',
    likes: 300,
    text: 'Finished my first marathon 🎉',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner2',
      title: 'ms',
      firstName: 'Jane',
      lastName: 'D',
      picture: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
  },
  {
    id: '3',
    image: 'https://source.unsplash.com/featured/?track',
    likes: 90,
    text: 'Intervals on the track today.',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner3',
      title: 'mr',
      firstName: 'Chris',
      lastName: 'P',
      picture: 'https://randomuser.me/api/portraits/men/12.jpg',
    },
  },
  {
    id: '4',
    image: 'https://source.unsplash.com/featured/?trail',
    likes: 180,
    text: 'Nature is the best track 🏞️',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner4',
      title: 'ms',
      firstName: 'Anna',
      lastName: 'W',
      picture: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
  },
  {
    id: '5',
    image: 'https://source.unsplash.com/featured/?sunset+run',
    likes: 75,
    text: 'Sunset run hits different.',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner5',
      title: 'mr',
      firstName: 'Leo',
      lastName: 'S',
      picture: 'https://randomuser.me/api/portraits/men/44.jpg',
    },
  },
  {
    id: '6',
    image: 'https://source.unsplash.com/featured/?morning+run',
    likes: 64,
    text: 'Easy zone 2 miles 🧘',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner6',
      title: 'ms',
      firstName: 'Nina',
      lastName: 'K',
      picture: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
  },
  {
    id: '7',
    image: 'https://source.unsplash.com/featured/?urban+run',
    likes: 140,
    text: 'City run + coffee ☕',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner7',
      title: 'mr',
      firstName: 'James',
      lastName: 'M',
      picture: 'https://randomuser.me/api/portraits/men/77.jpg',
    },
  },
  {
    id: '8',
    image: 'https://source.unsplash.com/featured/?race+finish',
    likes: 500,
    text: 'Podium finish 🏅',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner8',
      title: 'ms',
      firstName: 'Lara',
      lastName: 'Z',
      picture: 'https://randomuser.me/api/portraits/women/77.jpg',
    },
  },
  {
    id: '9',
    image: 'https://source.unsplash.com/featured/?run+group',
    likes: 89,
    text: 'Group long run 👟👟👟',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner9',
      title: 'mr',
      firstName: 'Brian',
      lastName: 'C',
      picture: 'https://randomuser.me/api/portraits/men/88.jpg',
    },
  },
  {
    id: '10',
    image: 'https://source.unsplash.com/featured/?running+shoes',
    likes: 55,
    text: 'New shoes day!',
    publishDate: new Date().toISOString(),
    tags: [],
    owner: {
      id: 'owner10',
      title: 'ms',
      firstName: 'Ella',
      lastName: 'R',
      picture: 'https://randomuser.me/api/portraits/women/55.jpg',
    },
  },
];

const Feed = () => {
  return (
    <Box sx={{ height: '100vh', overflowY: 'scroll', px: 2 }}>
      {samplePosts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          index={index}
        />
      ))}
    </Box>
  );
};

export default Feed;
