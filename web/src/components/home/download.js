import React from 'react';
import { Typography, Button, Grid } from '@material-ui/core';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import ComputerIcon from '@material-ui/icons/Computer';
import LanguageIcon from '@material-ui/icons/Language';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: '50px 20px 20px 30px'
  },
  button: {
    padding: 0,
    borderRadius: '8px',
    lineHeight: 'normal',
    fontWeight: 'normal',
    textTransform: 'none'
  }
}));

export default function Download() {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div style={{ textAlign: 'center' }}>
        <Typography style={{ color: '#172755', fontSize: '36px', fontWeight: 'bold' }}>
          Sử dụng ngay trên mọi nền tảng
        </Typography>
        <div style={{ marginTop: '30px' }}>
          <Grid container spacing={2}>
            <Grid item md={4} xs={12}>
              <Button className={classes.button}
                style={{
                  height: '100px', width: '350px', color: 'white', backgroundColor: '#1daf1a',
                  padding: '0px 15px 0px 15px'
                }}
              >
                <ComputerIcon style={{ width: '50px', height: '50px', marginRight: '15px' }} />
                <Typography style={{ textAlign: 'left', fontSize: '24px' }}>
                  Tải về phiên bản trên <b>Window</b>
                </Typography>
              </Button>


            </Grid>
            <Grid item md={4} xs={12}>
              <Button className={classes.button}
                style={{
                  height: '100px', width: '350px', color: 'white', backgroundColor: '#1daf1a',
                  padding: '0px 15px 0px 15px'
                }}
              >
                <PhoneAndroidIcon style={{ width: '50px', height: '50px', marginRight: '15px' }} />
                <Typography style={{ textAlign: 'left', fontSize: '24px' }}>
                  Tải về phiên bản trên <b>Android</b>
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button className={classes.button}
                style={{
                  height: '100px', width: '350px', color: 'white', backgroundColor: '#1daf1a',
                  padding: '0px 15px 0px 15px'
                }}
              >
                <LanguageIcon style={{ width: '50px', height: '50px', marginRight: '15px' }} />
                <Typography style={{ textAlign: 'left', fontSize: '24px' }}>
                  Sử dụng ngay trên <b>Website</b>
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}