import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, GlassWater, Trash2, Thermometer, Droplets, Coins, AlertTriangle } from 'lucide-react';
import { Dialog } from '@capacitor/dialog';

const MachineCard = ({ machine, onDelete }) => {
    const warnings = [];
    const LOW_WATER_THRESHOLD = 10;
    const HIGH_COIN_THRESHOLD = 90;
    const MAX_COLD_TEMP_THRESHOLD = 15; // degrees Celsius

    if (machine.waterLevel <= LOW_WATER_THRESHOLD) {
        warnings.push({
            type: 'water',
            message: 'Low water level'
        });
    }

    if (machine.coinLevel >= HIGH_COIN_THRESHOLD) {
        warnings.push({
            type: 'coin',
            message: 'Coin box full'
        });
    }

    if (machine.waterTemp > MAX_COLD_TEMP_THRESHOLD) {
        warnings.push({
            type: 'temp',
            message: 'Water not cold'
        });
    }

    return (
        <div className={`machine-card ${warnings.length > 0 ? 'has-warnings' : ''}`}>
            <div className="machine-header">
                <div>
                    <h3 className="machine-name">{machine.name}</h3>
                    <p className="machine-id">ID: {machine.id}</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(machine.id);
                    }}
                    className="delete-btn"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="machine-params">
                <div className="param-item">
                    <Thermometer size={20} />
                    <span>{machine.waterTemp}°C</span>
                </div>
                <div className="param-item">
                    <Droplets size={20} />
                    <span>{machine.waterLevel}%</span>
                </div>
                <div className="param-item">
                    <Coins size={20} />
                    <span>{machine.coinLevel}%</span>
                </div>
            </div>

            {warnings.length > 0 && (
                <div className="machine-warnings">
                    {warnings.map((warning, index) => (
                        <div key={index} className={`warning-item warning-${warning.type}`}>
                            <AlertTriangle size={16} />
                            <span>{warning.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MachineDashboard = () => {
    const [activeTab, setActiveTab] = useState('machines');
    const [machines, setMachines] = useState([]);
    const [newMachineId, setNewMachineId] = useState('');
    const [newMachineLocation, setNewMachineLocation] = useState('');
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserName(userDoc.data().fullName);
                }
            } else {
                setUser(null);
                setUserName('');
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (!user) {
            setMachines([]);
            return;
        }

        const machinesRef = collection(db, "machines");
        const q = query(machinesRef, where("owner", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const machineData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMachines(machineData);
        }, async (err) => {
            console.error("Error with real-time machine listener:", err);
            await Dialog.alert({
                title: 'Error',
                message: 'Failed to load machine data in real-time.',
                buttonTitle: 'OK',
            });
        });

        return () => unsubscribe();
    }, [user]);

    const handleDeleteMachine = async (machineId) => {
        const { value } = await Dialog.confirm({
            title: 'Confirm Release',
            message: 'Are you sure you want to release this machine?',
            okButtonTitle: 'Yes, Release',
            cancelButtonTitle: 'Cancel',
        });

        if (value) {
            try {
                const machineRef = doc(db, 'machines', machineId);
                await updateDoc(machineRef, {
                    owner: null,
                    status: 'unclaimed'
                });
            } catch (err) {
                console.error("Error releasing machine:", err);
                await Dialog.alert({
                    title: 'Error',
                    message: 'Failed to release machine. Please try again.',
                    buttonTitle: 'OK',
                });
            }
        }
    };

    const handleAddMachine = async (e) => {
        e.preventDefault();

        if (!newMachineId || !newMachineLocation) {
            await Dialog.alert({
                title: 'Input Required',
                message: 'Both Machine ID and Location fields are required.',
                buttonTitle: 'OK',
            });
            return;
        }

        if (!user) {
            await Dialog.alert({
                title: 'Authentication Error',
                message: 'You must be logged in to add a machine.',
                buttonTitle: 'OK',
            });
            return;
        }

        try {
            const machineRef = doc(db, 'machines', newMachineId);
            const machineDoc = await getDoc(machineRef);

            if (!machineDoc.exists()) {
                await Dialog.alert({
                    title: 'Invalid ID',
                    message: 'A machine with this ID does not exist.',
                    buttonTitle: 'OK',
                });
                return;
            }

            const machineData = machineDoc.data();
            if (machineData.status === 'claimed') {
                await Dialog.alert({
                    title: 'Machine Claimed',
                    message: 'This machine is already claimed by another user.',
                    buttonTitle: 'OK',
                });
                return;
            }

            await updateDoc(machineRef, {
                owner: user.uid,
                status: 'claimed',
                name: newMachineLocation
            });

            setNewMachineId('');
            setNewMachineLocation('');
            setActiveTab('machines');
        } catch (err) {
            console.error("Error adding machine:", err);
            await Dialog.alert({
                title: 'Error',
                message: 'Failed to add machine. Please try again.',
                buttonTitle: 'OK',
            });
        }
    };

    const handleLogout = async () => {
        const { value } = await Dialog.confirm({
            title: 'Confirm Logout',
            message: 'Are you sure you want to log out?',
            okButtonTitle: 'Logout',
            cancelButtonTitle: 'Stay',
        });

        if (value) {
            try {
                await signOut(auth);
                navigate('/');
            } catch (error) {
                console.error("Error signing out:", error);
                await Dialog.alert({
                    title: 'Error',
                    message: 'Failed to sign out. Please try again.',
                    buttonTitle: 'OK',
                });
            }
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'machines':
                return (
                    <div className="dashboard-content">
                        <h1 className="auth-title">Your Machines</h1>
                        {machines.length === 0 ? (
                            <div className="empty-state"><GlassWater size={48} /><p>No machines registered</p><span>Add your first machine</span></div>
                        ) : (
                            <div>{machines.map((machine) => (<MachineCard key={machine.id} machine={machine} onDelete={handleDeleteMachine} />))}</div>
                        )}
                    </div>
                );
            case 'add':
                return (
                    <div className="dashboard-content">
                        <h1 className="auth-title">Add New Machine</h1>
                        <form onSubmit={handleAddMachine} className="auth-form">
                            <input type="text" placeholder="Machine Unique ID" value={newMachineId} onChange={(e) => setNewMachineId(e.target.value)} className="input-field" />
                            <p className='auth-footer'>This ID is located at the back of the machine.</p>
                            <input type="text" placeholder="Machine Location" value={newMachineLocation} onChange={(e) => setNewMachineLocation(e.target.value)} className="input-field" />
                            <button type="submit" className="btn-primary">Add Machine</button>
                        </form>
                    </div>
                );
            case 'settings':
                return (
                    <div className="dashboard-content">
                        <h1 className="auth-title">Settings</h1>
                        <div className="settings-content">
                            <p className="user-greeting">Logged in as: <strong>{userName || user?.email}</strong></p>
                            <button onClick={handleLogout} className="btn-primary logout-btn">Logout</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard">
            {renderTabContent()}
            <div className="bottom-nav">
                <button onClick={() => setActiveTab('machines')} className={activeTab === 'machines' ? 'active' : ''}><GlassWater size={24} /><span>Machines</span></button>
                <button onClick={() => setActiveTab('add')} className={activeTab === 'add' ? 'active' : ''}><Plus size={24} /><span>Add Machine</span></button>
                <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}><Settings size={24} /><span>Settings</span></button>
            </div>
        </div>
    );
};

export default MachineDashboard;
