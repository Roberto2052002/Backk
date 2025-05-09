import { Search, Person, Chat, Notifications } from '@mui/icons-material';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@base/store';
import FriendRequest from '@components/topbar/FriendRequests';
import ProfileSettingsPopover from '@components/topbar/ProfileSettingsPopover';
import TopbarPopover from '@components/topbar/TopbarPopover';
import { setIsMobileNavbarActive } from '@helpers/reducers/appReducer';
import { selectCurrentUser, selectFriendRequests } from '@helpers/selectors/APIRequestSelector';
import { selectIsMobileNavbarActive } from '@helpers/selectors/appSelector';
import { appLogo } from '@helpers/utils/SVG';

export default function Topbar() {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);
  const friendRequestCount = useAppSelector(selectFriendRequests).length;
  const isFriendRequestExist = useAppSelector(selectFriendRequests).length > 0;
  const [isCurrentUserLoaded, setIsCurrentUserLoaded] = useState(false);
  const dispatch = useAppDispatch();
  const isMobileNavbarActive = useAppSelector(selectIsMobileNavbarActive);

  const handleMobileNavbarClick = () => {
    dispatch(setIsMobileNavbarActive(!isMobileNavbarActive));
  };

  useEffect(() => {
    if (currentUser) {
      setIsCurrentUserLoaded(true);
    }
  }, [currentUser]);

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      px={3}
      py={1}
      className="h-14 w-full bg-[#1877f2] z-[999] sticky top-0"
      position="sticky"
    >
      <Box
        className={isMobile ? 'w-[50%]' : 'w-[30%]'}
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={1}
      >
        {isMobile ? (
          !isMobileNavbarActive ? (
            <MenuOutlinedIcon
              fontSize="large"
              className="text-white"
              onClick={() => handleMobileNavbarClick()}
            />
          ) : (
            <CloseTwoToneIcon
              fontSize="large"
              className="text-white"
              onClick={() => handleMobileNavbarClick()}
            />
          )
        ) : null}

        <Box>
          <Link
            className="flex flex-row gap-[12px] items-center"
            aria-label={t('a11y.goToHome')}
            to="/"
          >
            <p className={`font-bold text-[#f5f5f5] cursor-pointer ${isMobile ? 'text-sm' : 'text-2xl'}`}>Just One More Day</p>
          </Link>
        </Box>
      </Box>

      {!isMobile ? (
        <Box
          display="flex"
          alignItems="center"
          className="flex w-[40%] rounded-[7.5rem] bg-white"
          py={1}
        >
          <Search className="!text-xl ml-2.5" />

          <input
            placeholder={t('components.topbar.search')}
            className="border-0 w-[70%] focus:outline-none"
          />
        </Box>
      ) : null}

      <Box
        display="flex"
        alignItems="center"
        className="flex w-[30%] text-white"
        flexDirection="row"
        justifyContent="end"
      >
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <TopbarPopover
              title={t('components.topbar.popover.userSettings')}
              icon={<SettingsIcon />}
              children={<ProfileSettingsPopover />}
              open={false}
            />
          </Box>
          <Box className="ml-4">
            <Link to="/login">
              <button className="bg-white text-[#1877f2] px-4 py-1 rounded hover:bg-gray-200">Login</button>
            </Link>
          </Box>
          <Box className="ml-4">
            <Link to="/register">
              <button className="bg-white text-[#1877f2] px-4 py-1 rounded hover:bg-gray-200">Register</button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
