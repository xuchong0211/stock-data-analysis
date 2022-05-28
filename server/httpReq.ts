export function GET(path: string, params: any = {}) {
  return fetch(path, {
    method: "GET",
    headers: { Accept: "application/json" },
    ...params,
  }).then((res) => {
    if (res.status !== 200) {
      console.log("GET failed:", res);
      return null;
    } else {
      return res.json();
    }
  });
}

export function POST(path: string, params: any = {}) {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...params,
  }).then((res) => {
    if (res.status !== 200) {
      console.log("POST failed:", res);
      return null;
    } else {
      return res.json();
    }
  });
}
