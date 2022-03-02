if (!Date.prototype.strftime) {
  Object.defineProperty(Date.prototype, 'strftime', {
    value(dateFormat = '%Y-%M-%d %H:%m:%s') { // === moment(this).format('YYYY-MM-DD HH:mm:ss')
      const year = this.getFullYear()
      const month = this.getMonth() + 1
      const day = this.getDate()
      const hour = this.getHours()
      const hour12 = hour > 12 ? (hour % 12) : hour
      const min = this.getMinutes()
      const sec = this.getSeconds()
      const msec = this.getMilliseconds()
      return dateFormat
        // 2018
        .replace(/%?Y+/, () =>  `${year}`)
        // (00..99)
        .replace(/%?y+/, () => `${year}`.substring(2, 4))
        // (1..12)
        .replace(/%?(_M)+/, () => `${month}`)
        // (01..12)
        .replace(/%?M+/, () => month < 10 ? `0${month}` : `${month}`)
        // (1..31)
        .replace(/%?(_d)+/, () => `${day}`)
        // (01..31)
        .replace(/%?d+/, () => day < 10 ? `0${day}` : day)
        // (0..23)
        .replace(/%?(_H)+/, () => `${hour}`)
        // (00..23)
        .replace(/%?H+/, () => hour < 10 ? `0${hour}` : `${hour}`)
        // (0..12)
        .replace(/%?(_h)+/, () => hour12)
        // (00..12)
        .replace(/%?h+/, () => hour12 < 10 ? `0${hour12}` : hour12)
        // (0..59)
        .replace(/%?(_m)+/, () => `${min}`)
        // (00..59)
        .replace(/%?m+/, () => min < 10 ? `0${min}` : `${min}`)
        // (0..59)
        .replace(/%?(_s)+/, () => `${sec}`)
        // (00..59)
        .replace(/%?s+/, () => sec < 10 ? `0${sec}` : `${sec}`)
        // PM, AM
        .replace(/%?P+/, () => hour > 12 ? 'PM' : 'AM')
        // pm, am
        .replace(/%?p+/, () => hour > 12 ? 'pm' : 'am')
        // ms
        .replace(/%?L+/, () => `${msec}`)
        // 一个星期的第几天 (1..7)
        .replace(/%?u+/, () => `${this.getDay() + 1}`)
        // 一个星期的第几天 (0..6)
        .replace(/%?w+/, () => `${this.getDay()}`)
    }
  })
}