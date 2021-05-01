import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import config from '../../constants/config.json';
import MyContext from '../mycontext/MyContext';
import SnackBar from '../snackbar/SnackBar';
import { makeStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import AddIcon from '@material-ui/icons/Add';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const API_URL = config.API_LOCAL;
const useStyles = makeStyles((theme) => ({
    root: (theme) => ({
        width: '95%',
        minHeight: '100%',
        borderRadius: '4px',
        paddingBottom: '24px',
        paddingTop: '24px',
    }),
    icon: {
        marginRight: theme.spacing(2),
    },
    heroContent: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(8, 0, 6),
    },
    heroButtons: {
        marginTop: theme.spacing(4),
    },
    cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardMedia: {
        paddingTop: '56.25%', // 16:9
    },
    cardContent: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
    centerCard: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
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
    titleFont: {
        fontWeight: 'bold',
        fontSize: '24px',
    },
    subTitleFont: {
        fontSize: '14px',
    },

    body: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '30px',
        paddingBottom: '10px',
        '& .MuiContainer-root': {
            padding: 0
        }
    },


}));

export default function Teams() {

    const classes = useStyles();

    const userID = localStorage.getItem('userID');
    const token = localStorage.getItem('jwtToken');
    const history = useHistory();
    const [errors, setErrors] = useState({});
    const [teams, setTeams] = useState([]);
    const { isLoggedIn } = useContext(MyContext);

    const [content, setContent] = useState("");
    const [showSnackbar, setShowSnackBar] = useState(false);

    useEffect(() => {
        console.log(isLoggedIn);
        if (isLoggedIn !== null && isLoggedIn === false) {
            history.push('/');
        }
        getTeams()

    }, [isLoggedIn]);

    const getTeams = async () => {

        console.log(userID);
        const res = await fetch(`${API_URL}/teams/${userID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
        console.log(res.body);
        if (res.status === 200) {
            const result = await res.json();
            console.log(result.teams);
            setTeams(result.teams)
            console.log(teams)
        } else {
            // alert("Some error when updating!")
        }
    }

    const walletTeam = (walletID) => {
        history.push(`/Wallet/${walletID}`)
    }
    const detailTeam = (teamID) => {
        history.push(`/teams/${teamID}/details`)
    }
    const createTeam = () => {
        setOpen(false);
        history.push(`/teams/create`)
    }

    const [joinID, setJoinID] = useState("");
    const handleJoinTeam = (joinID) => {
        setJoinID(joinID);
    }
    const joinTeam = async () => {
        const data = {
            teamID: joinID
        }
        const res = await fetch(`${API_URL}/teams/join/${userID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        history.push("/teams")
        handleCloseDiaForm();
        handleClose();
    }

    const deleteTeam = async (TeamID) => {
        const data = {
            UserID: userID
        }
        const res = await fetch(`${API_URL}/teams/${TeamID}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        history.push("/teams")
    }

    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const [openDiaForm, setOpenDiaForm] = React.useState(false);
    const handleClickOpenDiaForm = () => {
        setOpenDiaForm(true);
    };
    const handleCloseDiaForm = () => {
        setOpenDiaForm(false);
    };

    console.log(teams)
    return (
        <>
            <SnackBar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} content={content} />

            <Container className={classes.root} maxWidth={null}>
                <div className={classes.title}>
                    <Breadcrumbs className={classes.breadcrumb} separator={<NavigateNextIcon fontSize="large" />} aria-label="breadcrumb">
                        <Typography className={classes.titleFont} color="textPrimary">
                            Danh sách nhóm
                        </Typography>
                    </Breadcrumbs>
                    <Typography className={classes.subTitleFont} color="textSecondary">Quản lý các khoản giao dịch tiền tệ nhóm </Typography>
                </div>
                <div className={classes.body}>
                    <Container component="main" maxWidth={null}>
                        <Grid container spacing={4}>
                        {
                                <Grid item xs={12} sm={6} md={4}>
                                    <Card className={`${classes.card} ${classes.centerCard}`}>
                                        <Button size="small"
                                            color="primary"
                                            onClick={createTeam}

                                        >
                                            <CardActions>
                                                <AddIcon style={{ fontSize: 100 }} />
                                            </CardActions>
                                        </Button>
                                        <Dialog open={openDiaForm} onClose={handleCloseDiaForm} aria-labelledby="form-dialog-title">
                                            <DialogTitle id="form-dialog-title">Tham Gia Nhóm </DialogTitle>
                                            <DialogContent>
                                                <DialogContentText>
                                                    Nhập mã nhóm
                                            </DialogContentText>
                                                <TextField
                                                    autoFocus
                                                    margin="dense"
                                                    id="teamCode"
                                                    label="Mã nhóm"
                                                    fullWidth
                                                    onChange={e => handleJoinTeam(e.target.value)}
                                                />
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={handleCloseDiaForm} color="primary">
                                                    Hủy
                                            </Button>
                                                <Button onClick={joinTeam} color="primary">
                                                    Tham gia
                                            </Button>
                                            </DialogActions>
                                        </Dialog>
                                    </Card>
                                </Grid>
                            }
                            {teams.map((card) => (
                                <Grid item key={card} xs={12} sm={6} md={4}>
                                    <Card className={classes.card}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                                {card.Name}
                                        </Typography>
                                        <CardContent className={classes.cardContent}>
                                            <Typography gutterBottom variant="h5" component="h2">
                                                {card.TeamID}
                                            </Typography>
                                            <Typography>
                                                {card.Description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button size="small" color="primary" onClick={(TeamID) => walletTeam(card.WalletID)}>
                                                Ví nhóm
                                        </Button>
                                            <Button size="small" color="primary" onClick={(TeamID) => detailTeam(card.ID)}>
                                                Thông tin nhóm
                                        </Button>
                                            <Button size="small" color="primary" onClick={(TeamID) => deleteTeam(card.ID)}>
                                                Xóa nhóm
                                        </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </div>
            </Container>
        </>
    );
}