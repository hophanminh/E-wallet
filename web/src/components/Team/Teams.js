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

const API_URL = config.API_LOCAL;
const useStyles = makeStyles((theme) => ({
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
    }
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

    const detailTeam = (teamID) => {
        history.push(`/teams/${teamID}/details`)
    }
    const createTeam = () => {
        history.push(`/teams/create`)
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
    return (
        <>
            <SnackBar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} content={content} />

            <div style={classes.body}>
                <Container component="main" maxWidth="lg">
                    <Grid container spacing={4}>
                        {teams.map((card) => (
                            <Grid item key={card} xs={12} sm={6} md={4}>
                                <Card className={classes.card}>
                                    <CardMedia
                                        className={classes.cardMedia}
                                        image="https://source.unsplash.com/random"
                                        title="Image title"
                                    />
                                    <CardContent className={classes.cardContent}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {card.TeamID}
                                        </Typography>
                                        <Typography>
                                            {card.Description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" color="primary" onClick={(TeamID) => detailTeam(card.ID)}>
                                            View
                                        </Button>
                                        <Button size="small" color="primary" onClick={(TeamID) => deleteTeam(card.ID)}>
                                            Delete
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                        {
                            <Grid item xs={12} sm={6} md={4}>
                                <Card className={`${classes.card} ${classes.centerCard}`}>
                                    <Button size="small"
                                            color="primary"
                                            onClick={() => createTeam()}

                                    >
                                    <CardActions>
                                            <AddIcon style={{ fontSize: 100 }}/>
                                    </CardActions>
                                    </Button>
                                </Card>
                            </Grid>
                        }
                    </Grid>
                </Container>
            </div>
        </>
    );
}