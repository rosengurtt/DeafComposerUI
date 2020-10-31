export class StringifiedMap {
    static set(mapito: string, key: any, value: any): string {
        let mapon = new Map()
        if (mapito) mapon = JSON.parse(mapito, this.reviver)
        mapon.set(key, value)
        return JSON.stringify(mapon, this.replacer)
    }
    static get(mapito: string, key: any) {
        let mapon = new Map()
        if (mapito) mapon = JSON.parse(mapito, this.reviver)
        return mapon.get(key)
    }
    static has(mapito: string, key: any): boolean {
        let mapon = new Map()
        if (mapito) mapon = JSON.parse(mapito, this.reviver)
        return mapon.has(key)
    }
    static delete(mapito: string, key: any): string {
        let mapon = new Map()
        if (mapito) mapon = JSON.parse(mapito, this.reviver)
        mapon.delete(key)
        return JSON.stringify(mapon, this.replacer)
    }

    static replacer(key, value) {
        const originalObject = this[key];
        if(originalObject instanceof Map) {
          return {
            dataType: 'Map',
            value: Array.from(originalObject.entries()), // or with spread: value: [...originalObject]
          };
        } else {
          return value;
        }
      }

      static reviver(key, value) {
        if(typeof value === 'object' && value !== null) {
          if (value.dataType === 'Map') {
            return new Map(value.value);
          }
        }
        return value;
      }
}