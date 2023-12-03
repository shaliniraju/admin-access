import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  Modal,
  Button,
  Checkbox,
  Pagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Sixth = () => {
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedRows, setCheckedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
        setMembers(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (member) => {
    setEditingMember(member);
    setOpenModal(true);
  };

  const handleSave = () => {
    // Implement your save logic here (e.g., send an update request to the server)
    // For demonstration purposes, we'll update the state directly
    setMembers((prevMembers) =>
      prevMembers.map((m) => (m.id === editingMember.id ? { ...m, ...editingMember } : m))
    );
    setEditingMember(null);
    setOpenModal(false);
  };

  const handleCancel = () => {
    // Reset the editing state
    setEditingMember(null);
    setOpenModal(false);
  };

  const handleDelete = (memberId) => {
    if (memberId) {
      // Deleting a single row
      const updatedMembers = members.filter((member) => member.id !== memberId);
      setMembers(updatedMembers);
    } else {
      // Deleting multiple selected rows
      const updatedMembers = members.filter((member) => !checkedRows.includes(member.id));
      setMembers(updatedMembers);
      setCheckedRows([]); // Clear the checked rows after deletion
    }
  };
  
  const handleChange = (field, value) => {
    setEditingMember((prevEditingMember) => ({ ...prevEditingMember, [field]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handleCheckboxChange = (memberId) => {
    setCheckedRows((prevCheckedRows) =>
      prevCheckedRows.includes(memberId)
        ? prevCheckedRows.filter((id) => id !== memberId)
        : [...prevCheckedRows, memberId]
    );
  };

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = members
    .filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(indexOfFirstRecord, indexOfLastRecord);

  const totalRecords = members.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase())).length;

  // Change page
  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Members Table</Typography>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            onChange={handleSearch}
            style={{ marginLeft: 'auto', marginRight: 16, backgroundColor: 'white' }}
          />
          <Button
  variant="contained"
  color={checkedRows.length > 0 ? "primary" : "secondary"}
  onClick={() => handleDelete()}
  disabled={checkedRows.length === 0}
  style={{ backgroundColor: checkedRows.length > 0 ?   '#a020f0' : '#301934' , color: 'white' }}
>
  Delete Selected
</Button>

        </Toolbar>
      </AppBar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  indeterminate={checkedRows.length > 0 && checkedRows.length < currentRecords.length}
                  checked={checkedRows.length === currentRecords.length}
                  onChange={() => {
                    const allChecked = checkedRows.length === currentRecords.length;
                    if (allChecked) {
                      setCheckedRows([]);
                    } else {
                      setCheckedRows(currentRecords.map((member) => member.id));
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                  Name
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                  Email
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                  Role
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRecords.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Checkbox
                    checked={checkedRows.includes(member.id)}
                    onChange={() => handleCheckboxChange(member.id)}
                  />
                </TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <IconButton color="primary" aria-label="edit" onClick={() => handleEdit(member)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" aria-label="delete" onClick={() => handleDelete(member.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={Math.ceil(totalRecords / recordsPerPage)}
        page={currentPage}
        onChange={handleChangePage}
        style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}
      />

      {/* Edit Modal */}
      <Modal open={openModal} onClose={handleCancel}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, backgroundColor: 'white', boxShadow: 24, p: 4 }}>
          <Typography variant="h6">Edit Member</Typography>
          <TextField label="Name" fullWidth value={editingMember?.name} onChange={(e) => handleChange('name', e.target.value)} />
          <TextField label="Email" fullWidth value={editingMember?.email} onChange={(e) => handleChange('email', e.target.value)} />
          <TextField label="Role" fullWidth value={editingMember?.role} onChange={(e) => handleChange('role', e.target.value)} />
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="contained" color="secondary" onClick={handleCancel} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Sixth;
