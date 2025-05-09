import {
  RssFeed,
  ChatSharp,
  VideoCameraBack,
  GroupSharp,
  BookmarkSharp,
  QuestionAnswerSharp,
  CasesSharp,
  EventAvailableSharp,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@base/store';
import NavbarMenuElement from '@components/shared/NavbarMenuElement';
import ProfileLink from '@components/shared/ProfileLink';
import { SideBarElementInfoTexts } from '@helpers/enums/enums';
import { selectCloseFriends } from '@helpers/selectors/APIRequestSelector';

export default function Sidebar() {
  const closeFriends = useAppSelector(selectCloseFriends);
  const { t } = useTranslation();

  const navbarElements = [
    {
      infoText: SideBarElementInfoTexts.MY_ACCOUNT,
      child: (
        <Link
          to="/myaccount"
          className="flex items-center"
        >
          <GroupSharp
            className="mr-4"
            aria-label="Go to My Account"
          />
        </Link>
      ),
    },
    {
      infoText: SideBarElementInfoTexts.CHATS,
      child: (
        <ChatSharp
          className="mr-4"
          aria-label={t('a11y.goToChats')}
        />
      ),
    },
    {
      infoText: SideBarElementInfoTexts.KLANS,
      child: (
        <GroupSharp
          className="mr-4"
          aria-label="Go to Klans"
        />
      ),
    },
    {
      infoText: SideBarElementInfoTexts.BOOKMARKS,
      child: (
        <BookmarkSharp
          className="mr-4"
          aria-label={t('a11y.goToBookmarks')}
        />
      ),
    },
    {
      infoText: SideBarElementInfoTexts.QUESTIONS,
      child: (
        <QuestionAnswerSharp
          className="mr-4"
          aria-label={t('a11y.goToQuestions')}
        />
      ),
    },
    {
      infoText: SideBarElementInfoTexts.YOUR_NEXT_CHALLENGE,
      child: (
        <CasesSharp
          className="mr-4"
          aria-label="Go to Your Next Challenge"
        />
      ),
    },
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      p={3}
      className={`w-full ${isMobile ? '' : 'sticky h-screen'} top-[56px]`}
    >
      <ul className="p-0 m-0 list-none">
        {navbarElements.map((element) => (
          <NavbarMenuElement
            key={element.infoText}
            infoText={element.infoText}
          >
            {element.child}
          </NavbarMenuElement>
        ))}
      </ul>

      <hr className="my-5 mx-0" />

      <h4 className="font-medium mb-4">{t('components.sidebar.closeFriends')}</h4>

      <Box
        className={`${isMobile ? '' : 'overflow-y-auto'}`}
        mb={isMobile ? 0 : 2}
      >
        <ul className={`${isMobile ? '' : 'mb-8'} p-0 m-0 list-none`}>
          {closeFriends
            ? closeFriends.map((friend) => (
                <ProfileLink
                  key={`${friend.picture?.large} ${Math.random().toString()}`}
                  user={friend}
                />
              ))
            : null}
        </ul>
      </Box>
    </Box>
  );
}
