import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    MenuItem,
    DialogTitle,
    Typography,
    TextField,
    Avatar,
    Button,
    Box,
    makeStyles,
} from '@material-ui/core/';
import moment from 'moment'
import DateFnsUtils from '@date-io/date-fns';
import {
    KeyboardDateTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';

import DefaultIcon from '../../../utils/DefaultIcon'

const useStyles = makeStyles({
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '-10px'
    },

    amountRow: {
        display: 'flex',
    },
    textField: {
        margin: '10px 10px 15px 0px'
    },

    typeBox: {
        padding: '0px 15px 0px 0px',
    },
    type1Text: {
        color: '#1DAF1A'
    },
    type2Text: {
        color: '#FF2626'
    },

    categoryIconBox: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '0px 10px 0px 10px',
    },
    iconText: {
        marginLeft: '10px',
    },
    buttonBox: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    button: {
        borderRadius: '4px',
        color: '#FFFFFF',
        fontWeight: 'bold',
        padding: '5px 40px',
        marginLeft: '20px'
    },
    closeButton: {
        backgroundColor: '#F50707',
    },
    editButton: {
        backgroundColor: '#1DAF1A',
    },
});

const fakeEvent = [];

export default function EditCategory({ data, updateList, open, setOpen }) {
    const classes = useStyles();
    const [list, setList] = useState([]);
    const [newCategory, setNewCategory] = useState(data);

    useEffect(() => {
        if (data) {
            setNewCategory(data)
        }
    }, [data])

    useEffect(() => {

    }, []);

    const clearNewCategory = () => {
        setNewCategory(data)
    }

    const handleCloseEditDialog = () => {
        setOpen(false);
        clearNewCategory();
    }
    const handleEdit = () => {
        updateList(newCategory);
        setOpen(false);
    }

    // transaction 
    const handleChange = (event) => {
        setNewCategory({
            ...newCategory,
            [event.target.name]: event.target.value
        });
    }

    return (
        <Dialog open={open} onClose={handleCloseEditDialog} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" >
                <Typography className={classes.title}>
                    Thay đổi khoản giao dịch
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box>
                    <Box className={classes.amountRow}>
                        <TextField
                            className={classes.textField}
                            size="small"
                            id="category"
                            name="catID"
                            select
                            label="Hạng mục"
                            value={newCategory.IconID}
                            onChange={handleChange}
                            variant="outlined"
                        >
                            {list.map((icon) => (
                                <MenuItem key={icon.ID} value={icon.ID}>
                                    <Box className={classes.categoryIconBox}>
                                        <DefaultIcon
                                            IconID={icon.IconID}
                                            backgroundSize={24}
                                            iconSize={14} />
                                        <Typography className={classes.iconText}>
                                            {}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            className={`${classes.textField}`}
                            size="small"
                            autoFocus
                            id="price"
                            name="price"
                            label="Số tiền *"
                            type="number"
                            value={newCategory.Name}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            variant="outlined"
                        />
                    </Box>


                    <Box className={classes.buttonBox}>
                        <Button className={`${classes.button} ${classes.closeButton}`} onClick={handleCloseEditDialog} variant="contained" >
                            Hủy
                        </Button>
                        <Button className={`${classes.button} ${classes.editButton}`} disabled={!open} onClick={handleEdit} variant="contained">
                            Thay đổi
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
            </DialogActions>
        </Dialog>
    );
}