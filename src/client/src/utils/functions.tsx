//  tipos de usuario sin el administrador

export const tenantUserTypes = [
  { id: 2, name: "Gerente administrativo" },
  { id: 3, name: "Gerente agrónomo" },
  { id: 4, name: "Especialista en suelos" },
  { id: 5, name: "Botánico " },
  { id: 6, name: "Agricultor" },
];

export const usertypeObjects = [
  { id: 1, label: "Service admin" },
  { id: 2, label: "Gerente administrativo" },
  { id: 3, label: "Gerente agrónomo" },
  { id: 4, label: "Especialista en suelos" },
  { id: 5, label: "Botánico " },
  { id: 6, label: "Agricultor" },
];

export function UsertypeIDToString(id: number): string {
  const usertypeString = usertypeObjects.find(
    (usertypeObj) => usertypeObj.id === id
  )?.label;

  return usertypeString || "";
}

export function formatedDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB");
}

export function isValidEmail(testString: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(testString);
}

/**
 *
 * @param {[unit: string]: number;} interval - PostgreSQL return object of data type 'interval'
 * @returns {string} readable string (in Spanish) of the interval
 */
export function TimeIntervalToReadableString(interval: {
  [unit: string]: number;
}): string {
  const timeUnitObjects = [
    { key: "days", singularLabel: "Día", pluralLabel: "Días" },
    { key: "weeks", singularLabel: "Semana", pluralLabel: "Semanas" },
    { key: "months", singularLabel: "Mes", pluralLabel: "Meses" },
    { key: "years", singularLabel: "Año", pluralLabel: "Años" },
  ];

  try {
    const intervalUnit = Object.keys(interval)[0] || "days";
    const intervalCuantity = interval[intervalUnit] || 0;
    const intervalUnitObject = timeUnitObjects.find(
      (unitObj) => unitObj.key === intervalUnit
    );
    let readableIntervalUnit = "";
    if (intervalCuantity === 1) {
      readableIntervalUnit = intervalUnitObject?.singularLabel || "";
    } else {
      readableIntervalUnit = intervalUnitObject?.pluralLabel || "";
    }
    const readableString = intervalCuantity + " " + readableIntervalUnit;
    return readableString;
  } catch {
    return "";
  }
}
