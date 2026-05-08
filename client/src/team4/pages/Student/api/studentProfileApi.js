import { apiDelete, apiGet, apiPost, apiPut, getStoredUserId, withCurrentUser } from "../../../utils/api";

function getCurrentUserQuery() {
	const userId = getStoredUserId();
	if (!userId) return "";
	return `?current_user=${encodeURIComponent(String(userId))}`;
}

export function getMyProfile() {
	return apiGet(`/users/me${getCurrentUserQuery()}`);
}

export function getUserById(userId) {
	return apiGet(`/users/${userId}`);
}

export function updateMyProfile(payload) {
	return apiPut("/users/me", withCurrentUser(payload));
}

export function uploadMyProfilePicture(pictureUrl) {
	return apiPut("/users/me", withCurrentUser({ picture: pictureUrl }));
}

export function changeMyPassword(password, newPassword) {
	return apiPut("/users/me/password", withCurrentUser({
		password,
		new_password: newPassword,
	}));
}

export function deleteMyAccount() {
	return apiDelete("/users/me", withCurrentUser({}));
}
