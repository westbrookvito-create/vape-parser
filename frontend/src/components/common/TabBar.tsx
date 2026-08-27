import { NavLink } from "react-router-dom";
import { BriefcaseIcon, HeartIcon, HomeIcon, UserIcon } from "./Icons";

const tabs = [
  { to: "/", label: "Лента", Icon: HomeIcon },
  { to: "/dating", label: "Знакомства", Icon: HeartIcon },
  { to: "/vacancies", label: "Вакансии", Icon: BriefcaseIcon },
  { to: "/profile", label: "Профиль", Icon: UserIcon },
];

export default function TabBar() {
  return (
    <nav className="tab-bar">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
          {({ isActive }) => (
            <>
              <Icon filled={isActive} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
