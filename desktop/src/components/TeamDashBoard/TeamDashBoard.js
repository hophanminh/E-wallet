import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useHistory } from "react-router-dom";
import {
  Container,
  Breadcrumbs,
  Typography,
  Grid,
  Box,
  Avatar,
  Divider,
  Button,
  makeStyles,
} from '@material-ui/core/';
import {
  MyContext,
  WalletContext,
  PopupContext,
  CategoryContext,
  EventContext
} from '../mycontext'
import POPUP from '../../constants/popup.json'
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import SettingsIcon from '@material-ui/icons/Settings';
import BarChartIcon from '@material-ui/icons/BarChart';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import SearchBar from './SearchBar'
import TransactionMini from './TransactionMini'
import TransactionDetail from './TransactionDetail'
import CategoryAccordion from './Accordion/CategoryAccordion'

import moment from 'moment'
import AddTransaction from './CRUDTransaction/AddTransaction';
import { getSocket } from "../../utils/socket";
import { formatMoney } from '../../utils/currency'
import EventAccordion from './Accordion/EventAccordion';

import config from '../../constants/config.json';
import cf from '../../Config/default.json';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

const API_URL = config.API_LOCAL;

const TeamDashBoard = () => {
  const classes = useStyles();
  const userID = localStorage.getItem('userID');
  const token = localStorage.getItem('jwtToken');
  const { id } = useParams();
  const history = useHistory();
  const socket = getSocket();
  const { setWalletID, selected, setSelected, list, setList, filterList, updateTxCategory } = useContext(WalletContext);
  const { setOpen } = useContext(PopupContext);
  const { setAllList } = useContext(CategoryContext);
  const { setEventList } = useContext(EventContext);

  const [stat, setStat] = useState({
    spend: 0,
    receive: 0,
    total: 0
  })
  const [team, setTeam] = useState();
  const [thu, setTHU] = useState([]);
  const [person, setPerson] = useState({});
  // get initial data
  useEffect(() => {
    socket.emit("get_team", { walletID: id }, ({ team, thu }) => {
      setTeam(team);
      setTHU(thu.filter(i => i.Role === 1));;
      var member = thu.filter(function (member) {
        return member.UserID === userID;
      });
      setPerson(member[0]);

    });

    setWalletID(id);

    socket.emit("get_transaction", { walletID: id }, ({ transactionList, total, spend, receive }) => {
      setList(transactionList);
      setSelected(transactionList[0]);
      setStat({
        spend: spend,
        receive: receive,
        total: total,
      })
    });

    socket.on(`wait_for_update_transaction_${id}`, ({ transactionList, total, spend, receive }) => {
      setList(transactionList);
      setStat({
        spend: spend,
        receive: receive,
        total: total,
      })
    });

    socket.emit("get_category", { walletID: id }, ({ defaultList, customList, fullList }) => {
      setAllList(defaultList, customList, fullList)
    });


    socket.on(`wait_for_update_category_${id}`, ({ defaultList, customList, fullList }) => {
      setAllList(defaultList, customList, fullList);
      updateTxCategory(fullList);
    });

    socket.emit("get_event", { walletID: id }, ({ eventList }) => {
      setEventList(eventList);
    });


    socket.on(`wait_for_update_event_${id}`, ({ eventList }) => {
      setEventList(eventList);
    });


    return () => {
      socket.off(`wait_for_update_transaction_${id}`);
      socket.off(`wait_for_update_category_${id}`);
      socket.off(`wait_for_update_event_${id}`);
      setOpen(null);
    }
  }, [id]);


  // add transaction
  const handleOpenAddDialog = () => {
    setOpen(POPUP.TRANSACTION.ADD_TRANSACTION);
  }

  const [open, setOpenDeleteDialog] = React.useState(false);

  const handleClickOpen = () => {
    setOpenDeleteDialog(true);
  };

  const handleClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = () => {
    { (person.Role === 1) ? deleteTeam() : leaveTeam() }
    handleClose();
  }

  const leaveTeam = async () => {
    const data = {
      UserID: userID
    }
    const res = await fetch(`${API_URL}/teams/${id}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    history.push("/teams")
  }

  const deleteTeam = async () => {
    const data = {
      UserID: userID
    }
    const res = await fetch(`${API_URL}/teams/${id}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    history.push("/teams")
  }

  return (
    <>
      <AddTransaction />

      <Container className={classes.root} maxWidth={null}>
        <Box className={classes.header}>
          <div className={classes.title}>
            <Breadcrumbs className={classes.breadcrumb} separator={<NavigateNextIcon fontSize="large" />} aria-label="breadcrumb">
              <Typography className={classes.titleFont} color="textPrimary">
                Ví nhóm {team?.Name}
              </Typography>
            </Breadcrumbs>
            <Typography className={classes.subTitleFont} color="textSecondary">Quản lý các khoản giao dịch tiền tệ nhóm </Typography>
          </div>
          <Box className={classes.actionBox}>
            <Link
              to={{
                pathname: `/teams/${team?.ID}/statistic`,
                state: { team: team }
              }}
              style={{ textDecoration: 'none', marginRight: 10 }}
            >
              <Button className={classes.teamStatisticButton} variant="outlined">
                <BarChartIcon className={classes.yellow} />
                &nbsp;Thống kê nhóm
              </Button>
            </Link>

            <Link to={`/teams/${team?.ID}/details`} style={{ textDecoration: 'none', marginLeft: 10 }} >
              <Button className={classes.teamInfoButton} variant="outlined">
                <SettingsIcon className={classes.green} />
                &nbsp;Thông tin nhóm
              </Button>
            </Link>
            <div style={{ textDecoration: 'none', marginLeft: 10 }} >
              <Button className={classes.teamLeaveButton} variant="outlined"
                onClick={handleClickOpen}
              >
                <ExitToAppIcon className={classes.red} />
                {(person.Role === 1) ? ` Xóa nhóm` : ` Rời nhóm`}
              </Button>
            </div>
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle >
                <Typography className={classes.title}>
                  Bạn có thực sự muốn {(person.Role === 1) ? ` xóa nhóm` : ` rời nhóm`}
                </Typography>
              </DialogTitle>
              <DialogActions>
                <Button style={{ color: "white", backgroundColor: "green", marginLeft: 10 }} variant="contained" color="primary" className={classes.margin} onClick={handleClose}>
                  Hủy
                  </Button>
                <Button style={{ color: "white", backgroundColor: "red", marginLeft: 10 }} variant="contained" color="primary" className={classes.margin} onClick={handleDelete}>
                  {(person.Role === 1) ? ` Xóa nhóm` : ` Rời nhóm`}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
        <div className={classes.body}>
          <Grid container spacing={5} className={classes.grid}>
            <Grid item lg={3} sm={12} xs={12}>
              <Box
                boxShadow={3}
                bgcolor="background.paper"
                className={classes.smallBox}>
                <Avatar className={`${classes.avatar} ${classes.totalBackGround}`}>
                  <AccountBalanceWalletIcon className={`${classes.smallBoxIcon} ${classes.totalColor}`} />
                </Avatar>
                <Box className={classes.wrap}>
                  <Typography className={classes.smallBoxNumber}>{formatMoney(stat.total)}</Typography>
                  <Typography className={classes.smallBoxText}>Tổng tiền </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item lg={3} sm={12} xs={12}>
              <Box
                boxShadow={3}
                bgcolor="background.paper"
                className={classes.smallBox}>
                <Avatar className={`${classes.avatar} ${classes.inBackGround}`}>
                  <TrendingUpIcon className={`${classes.smallBoxIcon} ${classes.inColor}`} />
                </Avatar>
                <Box className={classes.wrap}>
                  <Typography className={classes.smallBoxNumber}>{formatMoney(stat.receive)}</Typography>
                  <Typography className={classes.smallBoxText}>Tiền thu tháng {moment(new Date()).format("MM/YYYY")} </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item lg={3} sm={12} xs={12}>
              <Box
                boxShadow={3}
                bgcolor="background.paper"
                className={classes.smallBox}>
                <Avatar className={`${classes.avatar} ${classes.outBackGround}`}>
                  <TrendingDownIcon className={`${classes.smallBoxIcon} ${classes.outColor}`} />
                </Avatar>
                <Box className={classes.wrap}>
                  <Typography className={classes.smallBoxNumber}>{formatMoney(stat.spend)}</Typography>
                  <Typography className={classes.smallBoxText}>Tiền chi tháng {moment(new Date()).format("MM/YYYY")} </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item lg={3} sm={12} xs={12}>
              <Box
                boxShadow={3}
                bgcolor="background.paper"
                className={classes.smallBoxAdd}>
                <Button className={classes.button} style={{ textTransform: 'none' }} onClick={handleOpenAddDialog}>
                  <Avatar className={`${classes.avatar} ${classes.addBackGround}`}>
                    <AddCircleOutlineIcon className={`${classes.smallBoxIcon} ${classes.addColor}`} />
                  </Avatar>
                  <Box className={classes.wrap}>
                    <Typography className={classes.smallBoxNumber}>Thêm giao dịch </Typography>
                  </Box>
                </Button>
              </Box>
            </Grid>

          </Grid>
          <Grid container spacing={5} alignItems="stretch" className={classes.lowerGrid}>
            <Grid item lg={3} sm={12} xs={12}>
              <Box
                boxShadow={3}
                bgcolor="background.paper"
                className={classes.longBox}>
                <SearchBar />
                <Divider className={classes.dividerBold} />
                <Box className={classes.longListBox}>
                  {(filterList || []).map((i, n) => {
                    return (
                      <React.Fragment key={i.id}>
                        <TransactionMini transactionData={i} />
                        <Divider className={classes.divider} />
                      </React.Fragment>
                    )
                  })}
                </Box>
              </Box>
            </Grid>

            <Grid item lg={6} sm={12} xs={12}>
              <Box
                boxShadow={3}
                bgcolor="background.paper"
                className={classes.transactionBox}>
                {filterList &&
                  <TransactionDetail thu={thu} />}
              </Box>
            </Grid>

            <Grid item lg={3} sm={12} >
              <div className={classes.buttonColumn}>
                <CategoryAccordion />
                <EventAccordion />
              </div>
            </Grid>

          </Grid>


        </div>

      </Container>
    </>
  );
}

export default TeamDashBoard;

const useStyles = makeStyles((theme) => ({
  root: (theme) => ({
    width: '95%',
    minHeight: '100%',
    borderRadius: '4px',
    paddingBottom: '24px',
    paddingTop: '24px',
  }),
  green: {
    color: '#1DAF1A'
  },
  red: {
    color: '#FF0000'
  },
  yellow: {
    color: '#fda92c'
  },
  card: (theme) => ({
    backgroundColor: theme.body,
    border: theme.fieldBorder,
  }),
  // out icon
  outColor: {
    color: '#FF2626'
  },
  outBackGround: {
    backgroundColor: 'rgba(255, 38, 38, 7%);',
  },
  // in icon
  inColor: {
    color: '#1DAF1A'
  },
  inBackGround: {
    backgroundColor: 'rgba(29, 175, 26, 7%);',
  },
  // total icon
  totalColor: {
    color: '#2196F3',
  },
  totalBackGround: {
    backgroundColor: 'rgba(33, 150, 243, 7%);',
  },
  // add icon
  addColor: {
    color: '#FFFFFF'
  },
  addBackGround: {
    backgroundColor: '#1DAF1A',
  },
  // upper section
  title: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '10px'
  },
  breadcrumb: {
    fontSize: '24px',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: '10px'
  },
  actionBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  teamInfoButton: {
    height: '40px',
    textTransform: 'none',
    borderColor: '#1DAF1A',
    padding: '5px 10px',
    backgroundColor: '#FFFFFF'
  },
  teamLeaveButton: {
    height: '40px',
    textTransform: 'none',
    borderColor: '#FF0000',
    padding: '5px 10px',
    backgroundColor: '#FFFFFF'
  },
  teamStatisticButton: {
    height: '40px',
    textTransform: 'none',
    borderColor: '#fda92c',
    padding: '5px 10px',
    backgroundColor: '#FFFFFF'
  },
  titleFont: {
    fontWeight: 'bold',
    fontSize: '24px',
  },
  subTitleFont: {
    fontSize: '14px',
  },

  // lower section
  body: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '30px',
    paddingBottom: '10px'
  },
  grid: {
    marginBottom: '20px',
  },
  lowerGrid: {
    marginBottom: '20px',
    minHeight: '630px',
  },
  wrap: {
    flexGrow: 3,
    marginLeft: '15px',
    wordWrap: 'break-word',
    overflow: 'hidden',
  },

  // 3 info box
  smallBox: {
    height: '100%',
    minHeight: '155px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: '40px',
    paddingRight: '15px',
  },
  avatar: {
    width: '50px',
    height: '50px',
  },
  smallBoxIcon: {
    width: '30px',
    height: '30px',
  },
  smallBoxNumber: {
    fontSize: '18px',
  },
  smallBoxText: {
    fontSize: '16px',
  },
  smallBoxAdd: {
    height: '100%',
    minHeight: '155px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  // 3 button
  buttonColumn: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  button: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: '40px',
    paddingRight: '15px',
    textAlign: 'left'
  },

  dividerBold: {
    width: '100%',
    backgroundColor: '#000000'
  },
  divider: {
    width: '100%',
  },

  // transaction list
  longBox: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  longListBox: {
    width: '100%',
    minHeight: '530px',
    maxHeight: '530px',
    overflowY: 'auto'
  },

  // transaction detail
  transactionBox: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexShrink: 0,
    minHeight: '530px',
  },

}));
