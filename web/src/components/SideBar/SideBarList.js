import React, { useState } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PeopleIcon from '@material-ui/icons/People';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import BarChartIcon from '@material-ui/icons/BarChart';
import {
  NavLink
} from "react-router-dom";


export default function SideBarList(props) {
  const [currentUser, setCurrentUser] = useState();
  return (
    <div>
      <ListItem button component={NavLink} to="/Wallet">
        <ListItemIcon>
          <AccountBalanceWalletIcon />
        </ListItemIcon>
        <ListItemText primary="Ví cá nhân" />
      </ListItem>
      {(
        <ListItem button component={NavLink} to="/Statistic">
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Thống kê" />
        </ListItem>
      )}
      {(
        <ListItem button component={NavLink} to="/teams">
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Nhóm" />
        </ListItem>
      )}
    </div>
  )
};