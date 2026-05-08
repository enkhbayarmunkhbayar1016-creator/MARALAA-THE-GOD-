import { createContext, useEffect, useState } from 'react';
import * as UserService from '../utils/UserService';

export const UserContext = createContext({})

export const UserProvider = ({ children }) => {
  const [push_token, setPushToken] = useState('');
  const [user, setUser] = useState();

  useEffect(() => {
    const init = async () => {
      console.log('loading token')
      if (await UserService.getToken()) {
        console.log('loading user')
        await reload()
      }
    }
    init()
  }, []);

  const reload = async () => {
    try {
      const result = await UserService.load()
      //if (result.code === 'Unauthorized') {
      //  await localStorage.removeItem('access_token')
      //} else 
      if (result.id > 0) {
        setUser(result)
      } else {
        console.log('login error', result)
      }
    } catch (ex) {
      console.log('login exception', ex)
    }
  }

  const handleLoginResult = async (response) => {
    const data = await response.json()
    if (data.status === 'error') {
      alert({
        type: 'error',
        text1: 'Нэвтэрч чадсангүй',
        text2: data.message,
      })
      return false
    }

    await localStorage.setItem('access_token', data.access_token)
    await localStorage.setItem('refresh_token', data.refresh_token)
    const user = await UserService.load()
    setPushToken((t) => t)
    setUser(user)

    return true
  }

  // Permission helper utilities
  const hasRole = (role) => {
    return user && user.roles && Array.isArray(user.roles) && user.roles.includes(role)
  }

  const isAdmin = () => hasRole('admin')
  const isSchoolAdmin = () => hasRole('school_admin')
  const isTeacher = () => hasRole('teacher')
  const isStudent = () => hasRole('student')

  // Checks whether current user can manage everything
  const canManageAll = () => isAdmin()

  // Checks whether user can manage resources for a given school
  const canManageSchool = (schoolId) => {
    if (isAdmin()) return true
    if (isSchoolAdmin() && user && user.school_id) return user.school_id === schoolId
    return false
  }

  // Permission to add/edit/delete exam grades
  const canEditExam = (schoolId) => {
    if (isAdmin()) return true
    if (isTeacher()) return true
    if (isSchoolAdmin() && user && user.school_id) return user.school_id === schoolId
    return false
  }

  // Permission to add/remove students
  const canManageStudents = (schoolId) => {
    if (isAdmin()) return true
    if (isTeacher()) return true
    if (isSchoolAdmin() && user && user.school_id) return user.school_id === schoolId
    return false
  }

  // Updated login to pass push_token into the handler so it is stored correctly
  const handleLoginResultWithToken = async (response, pushToken = '') => {
    const data = await response.json()
    if (data.status === 'error') {
      alert({
        type: 'error',
        text1: 'Нэвтэрч чадсангүй',
        text2: data.message,
      })
      return false
    }

    await localStorage.setItem('access_token', data.access_token)
    await localStorage.setItem('refresh_token', data.refresh_token)
    const user = await UserService.load()
    if (pushToken) setPushToken(pushToken)
    setUser(user)

    return true
  }

  const login = async (email, password, push_token) => {
    try {
      const data = await UserService.logIn({ email, password, push_token })
      return handleLoginResult(data)
    } catch (e) {
      alert('Нэвтэрч чадсангүй. Сервертэй харьцахад алдаа гарлаа.')
    }
    return false
  }

  const logout = async () => {
    await localStorage.removeItem('access_token')
    await localStorage.removeItem('refresh_token')
    setUser(undefined)
  }

  return <UserContext.Provider value={{
    push_token,
    user,
    logout,
    login,
    reload,
    // role helpers
    hasRole,
    isAdmin,
    isSchoolAdmin,
    isTeacher,
    isStudent,
    canManageAll,
    canManageSchool,
    canEditExam,
    canManageStudents
  }}>
    {children}
  </UserContext.Provider>
}