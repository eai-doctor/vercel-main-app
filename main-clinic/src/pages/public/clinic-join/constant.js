import { OTHER_PORTAL_URL } from "@/app/portal";
export const headerMenus = [{
  value: "For Clinicians",
  url : "/clinic-join"
},{
  value: "For Patients",
  url : OTHER_PORTAL_URL || "/"
},{
  value: "Research",
  url : "https://tech.e-ai.ca"
},{
  value: "Company",
  url : "/about-us"
}];
