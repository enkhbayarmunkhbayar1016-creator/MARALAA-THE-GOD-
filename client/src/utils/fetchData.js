const BASE_URL = "https://todu.mn/bs/lms/v1";


const refreshToken = (refresh_token) =>
    fetch(`${BASE_URL}/token/refresh`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token })
        }
    )

export const fetchData = async (input, method = 'GET', data, isProtected, isText) => {
    const headers = {
        'Content-Type': 'application/json',
    }
    if (isProtected) {
        const token = await localStorage.getItem('access_token')
        headers.Authorization = `Bearer ${token}`
    }
    const init = {
        method: method,
        headers: headers
    }
    if (data) {
        init.body = JSON.stringify(data)
    }
    const response = await fetch(input, init)
    let retry = [401, 403].includes(response.status)
    if (!retry) {
        const result = isText ? await response.text() : await response.json()
        if (response.ok) {
            return result
        }
        retry = result.code === 'Unauthorized'
    }
    if (retry) {
        const refresh_token = await localStorage.getItem('refresh_token')
        if (refresh_token) {
            try {
                const refresh_token = await localStorage.getItem('refresh_token')
                if (refresh_token) {
                    const response = await refreshToken(refresh_token)
                    if (response.ok) {
                        const data = await response.json()
                        if (data.access_token && data.refresh_token) {
                            await localStorage.setItem('access_token', data.access_token)
                            await localStorage.setItem('refresh_token', data.refresh_token)

                            init.headers.Authorization = `Bearer ${data.access_token}`
                            const response = await fetch(input, init)
                            const result = isText ? await response.text() : await response.json()
                            if (response.ok) {
                                return result
                            } else {
                                alert({
                                    type: 'error',
                                    text1: 'Сервертэй харьцахад асуудал гарлаа',
                                    text2: response.status + ': ' + response.statusText,
                                })
                            }
                        }
                    }
                    alert({
                        type: 'error',
                        text1: 'Дахин нэвтэрнэ үү',
                        text2: 'Нэвтрэх хугацаа дууссан, эсвэл өөр төхөөрөмжөөс давхар орсон байна.',
                    })
                }
                alert({
                    type: 'error',
                    text1: 'Энэ үйлдлийг хийж чадсангүй',
                    text2: 'Хэрэглэгчийн эрхээр нэвтэрч орно уу.',
                })
            } catch (e) {
                alert('Нэвтрэх эрхийг сэргээж чадсангүй. Сервертэй харьцахад алдаа гарлаа.')
            }

        }
    } else {
        alert('Сервертэй харьцахад асуудал гарлаа. ' + response.status + ': ' + response.statusText)
    }
}