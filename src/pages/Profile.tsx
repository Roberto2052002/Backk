import { Box, Avatar, Typography, Grid } from '@mui/material';
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
export default function Profile() {
  return (
    <Box p={4}>
      {/* Header: Profile picture + Username + PRs */}
      <Box
        display="flex"
        alignItems="center"
        gap={4}
        mb={4}
      >
        <Avatar
          src="https://via.placeholder.com/100"
          alt="Profile"
          sx={{ width: 100, height: 100 }}
        />

        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          height={100}
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            lineHeight={1}
            sx={{ position: 'relative', top: '40px' }}
          >
            run_roberto
          </Typography>

          <Box
            display="flex"
            flexWrap="wrap"
            gap={2}
            justifyContent="center"
          >
            {[
              { label: '5K', time: '20:40' },
              { label: '10K', time: '44:30' },
              { label: 'Half Marathon', time: '1:47:34' },
              { label: 'Marathon', time: '—' },
            ].map((pr, index) => (
              <Box
                key={index}
                p={2}
                px={3}
                border="2px solid #ccc"
                borderRadius="10px"
                minWidth="130px"
                textAlign="center"
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ fontSize: '1rem' }}
                >
                  {pr.label}
                </Typography>
                <Typography sx={{ fontSize: '1.1rem' }}>{pr.time}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Posts Grid */}
      <Grid
        container
        spacing={2}
      >
        {[...Array(6)].map((_, i) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={i}
          >
            <Box
              component="img"
              src={`https://source.unsplash.com/random/400x400?sig=${i}`}
              alt={`Post ${i + 1}`}
              width="100%"
              borderRadius="8px"
            />
          </Grid>
        ))}
      </Grid>

      {/* Calendar */}
      <Box
        mt={4}
        width="100%"
        height="700px"
        sx={{
          '& .react-calendar': {
            width: '100%',
            height: '100%',
            fontSize: '1.5rem',
          },
          '& .react-calendar__tile': {
            height: '100px',
            padding: '20px 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          '& .react-calendar__month-view__days': {
            height: '100%',
          },
          '& .react-calendar__month-view__weekdays abbr': {
            fontSize: '1.1rem',
          },
        }}
      >
        <Calendar />
      </Box>
    </Box>
  );
}
