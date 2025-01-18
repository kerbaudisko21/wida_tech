export const excelDateToJsDate = (serial) => {
    const epoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    return new Date(epoch.getTime() + (serial * msPerDay));
};

export const formatDateToDDMMYYYY = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

export const convertDateFormat = (date) => {
    if (typeof date === 'string') {
        const parts = date.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }

    if (date instanceof Date && !isNaN(date)) {
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    return null;
};
