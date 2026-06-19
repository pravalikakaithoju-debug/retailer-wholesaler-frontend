import { useState } from 'react';
import API from '../services/api';

function ProfilePage() {

    const [avatar, setAvatar] =
        useState(null);

    const handleAvatarUpload =
        async () => {

        if (!avatar) {

            alert(
                'Select an image'
            );

            return;
        }

        const formData =
            new FormData();

        formData.append(
            'avatar',
            avatar
        );

        try {

            const response =
                await API.post(
                    'accounts/upload-avatar/',
                    formData,
                    {
                        headers: {
                            'Content-Type':
                                'multipart/form-data'
                        }
                    }
                );

            alert(
                'Avatar Updated Successfully'
            );

            console.log(
                response.data
            );

        } catch (error) {

            console.log(error);

            alert(
                'Upload Failed'
            );
        }
    };

    return (

        <div
            style={{
                padding: '20px'
            }}
        >

            <h2>
                My Profile
            </h2>

            <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                    setAvatar(
                        e.target.files[0]
                    )
                }
            />

            <br />
            <br />

            <button
                onClick={
                    handleAvatarUpload
                }
            >
                Change Avatar
            </button>

        </div>
    );
}

export default ProfilePage;