import React, { useEffect, useState, useContext } from 'react';
import { useHistory,useParams  } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import {
    makeStyles,
  } from '@material-ui/core/';
// import ImageUploader from './ImageUploader';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import SaveIcon from '@material-ui/icons/Save';
import Grid from '@material-ui/core/Grid';
import * as helper from '../../utils/helper';
import palette from '../../constants/palette.json';
import MyContext from '../mycontext/MyContext';
import SnackBar from '../snackbar/SnackBar';
import config from '../../constants/config.json';
import MembersOfTeam from '../Team/Members';
import copy from "copy-to-clipboard";  
// import ForwardToInboxIcon from '@material-ui/icons/ForwardToInbox';

const API_URL = config.API_LOCAL;
const useStyles = makeStyles((theme) => ({
    wallpaper: {
        width: '100%',
        height: '50vh'
    },
    body: {
        marginTop: '10vh',
        marginBottom: '10vh',
        display: 'flex',
        justifyContent: 'center',
        align: 'center'
    },
    buttonColumn: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
}))

export default function TeamProfile() {
    const classes = useStyles();

    const userID = localStorage.getItem('userID');
    const token = localStorage.getItem('jwtToken');
    const teamID = useParams().TeamID;
    console.log(teamID);
    const history = useHistory();
    const [errors, setErrors] = useState({});
    const [teamName, setTeamName] = useState("");
    const [description, setDiscription] = useState("");
    const [numberUser, setNumberUser] = useState(10);
    const [avatar, setAvatar] = useState(null);
    const { isLoggedIn } = useContext(MyContext);
    const [content, setContent] = useState("");
    const [showSnackbar, setShowSnackBar] = useState(false);
    const [members, setMembers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDisabledInput, setIsDisableInput] = useState(true);

    useEffect(() => {
        console.log(isLoggedIn);
        if (isLoggedIn !== null && isLoggedIn === false) {
            history.push('/');
        }
        getTeamDetail();
        getTeamMembers();
    }, [isLoggedIn]);

    useEffect(() => {
        isAdminTeam();
      }, [members]);

    const getTeamMembers = async () => {
    const res = await fetch(`${API_URL}/teams/${teamID}/members`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        }
    });
    console.log(res.body);
    if (res.status === 200) {
        const result = await res.json();
        console.log(result.members);
        setMembers(result.members);
    } else {
        // alert("Some error when updating!")
    }
    }

    const isAdminTeam = () => {
        console.log("userID" + userID);
        console.log('mem', members);
        // const fakeArray = members.slice();
        // fakeArray
        //   .filter(member => member.ID === userID)
        //   .map(member => {
        //     console.log("Role: " + member.Role)
        //     if (member.Role === 1)
        //       setIsAdmin(true);
        //     else setIsAdmin(false)
        //   })
    
        let _isAdmin = false;
    
        members.forEach((mem) => {
    
          if (mem.ID === userID) {
            if (mem.Role === 1) {
              _isAdmin = true;
              setIsDisableInput(false);
              return;
            }
          }
        });
        console.log(_isAdmin);
        setIsAdmin(_isAdmin);
      }

    const getTeamDetail = async () => {
        const res = await fetch(`${API_URL}/teams/details/${teamID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Body res: ",res.body);
        if (res.status === 200) {
            const result = await res.json();
            console.log(result.teams[0]);
            const team = result.teams[0];
            setTeamName(team.Name);
            setDiscription(team.Description)
            setNumberUser(team.MaxUsers)
        } else {
            // alert("Some error when updating!")
        }
    }


    const handleTeamNameChange = (teamName) => {
        setTeamName(teamName);
    }
    const handleNumberUsers = (number) => {
        setNumberUser(number);
    }
    const handleDescription = (des) => {
        setDiscription(des);
    }

    const handleSaveChange = async () => {

        const errorObjs = {
        };

        if (helper.isBlankString(teamName)) {
            errorObjs.teamName = "Tên hiển thị không được để trống";
        }

        setErrors(errorObjs);

        if (Object.keys(errorObjs).length > 0) {
            return;
        }

        const data = {
            Name: teamName,
            MaxUsers: numberUser,
            Description: description,
            UserID: userID
        }
        console.log(data);
        const res = await fetch(`${API_URL}/teams/details/${teamID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (res.status === 200) {
            setContent("Cập nhật thành công");
            setShowSnackBar(true);
        } else {
            // alert("Some error when updating!")
            const result = await res.json();
            console.log(result);
            setContent(result.msg);
            setShowSnackBar(true);
        }
    }

    const copyToClipboard = () => {
        copy(teamID);
        setContent("Đã lưu mã tham dự nhóm");
        setShowSnackBar(true);
     }

    return (
        <>
            <SnackBar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} content={content} />
            {/* <div class="wallpaper" style={{ ...styles.wallpaper }}>
            </div> */}
            <div className={classes.body}>
                <Container xs={12} sm={12} md={6} component="main" maxWidth="lg">
                    <Grid container spacing={5} className={classes.grid}>
                        <Grid item align="center" lg={9} sm={12}>
                            <div style={{ textAlign: 'center', width: '80%' }}>
                                <Typography component="h2" variant="h5" style={{ fontWeight: 'bold' }}>
                                    Thông tin tạo nhóm
                                </Typography>
                                <div style={{ margin: '20px 0 20px' }}>
                                    <div className="container">
                                        <Typography style={{ fontWeight: 'bold' }} variant="h6">Tên nhóm</Typography>
                                        <div className="input-invalid">{errors.teamName}</div>
                                    </div>
                                    <TextField placeholder="Tên nhóm" variant="outlined"
                                                margin="normal" required fullWidth autoFocus
                                                onChange={e => handleTeamNameChange(e.target.value)}
                                                value={teamName}
                                                disabled={isDisabledInput}
                                    />

                                    <div className="container margin-top-10">
                                        <Typography style={{ fontWeight: 'bold' }} variant="h6">Số lượng thành viên</Typography>
                                        <div className="input-invalid">{errors.numberUser}</div>
                                    </div>
                                    <TextField placeholder="Số lượng" variant="outlined"
                                                margin="normal" required fullWidth
                                                value={numberUser}
                                                onChange={e => handleNumberUsers(e.target.value)}
                                                disabled={isDisabledInput}
                                    />

                                    <div className="container margin-top-10">
                                        <Typography style={{ fontWeight: 'bold' }} variant="h6">Mô tả</Typography>
                                    </div>
                                    <TextField placeholder="Mô tả"
                                                variant="outlined" 
                                                margin="normal" 
                                                required fullWidth
                                                onChange={e => handleDescription(e.target.value)}
                                                value={description}
                                                multiline
                                                disabled={isDisabledInput}
                                    />
                                    <div className="container margin-top-10 ">
                                        <Button type="submit" size="large" variant="contained" style={{ backgroundColor: palette.primary, color: 'white', fontWeight: 'bold', marginTop: '20px' }}
                                            onClick={copyToClipboard}
                                            // startIcon={<ForwardToInboxIcon />}
                                        >
                                            Mã tham gia nhóm
                                        </Button>  
                                        <Button type="submit" size="large" color="secondary" variant="contained" style={{ color: 'white', fontWeight: 'bold', marginTop: '20px' }}
                                            onClick={handleSaveChange}
                                            startIcon={<SaveIcon />}
                                            disabled={isDisabledInput}
                                        >
                                            Cập nhật thông tin
                                        </Button>
                                    </div>
     
                                </div>
                            </div>
                        </Grid>
                        <Grid item lg={3} sm={12}>
                            <div className={classes.buttonColumn}>
                                <MembersOfTeam members = {members} isAdmin = {isAdmin} teamID = {teamID} getTeamMembers = {getTeamMembers}></MembersOfTeam>
                            </div>
                        </Grid>
                    </Grid>
                </Container>
            </div>
        </>
    );
}