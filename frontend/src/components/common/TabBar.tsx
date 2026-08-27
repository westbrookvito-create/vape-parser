import { NavLink } from "react-router-dom";
import { useMe } from "../../store/MeContext";
import { BriefcaseIcon, HeartIcon, HomeIcon, ShieldIcon, UserIcon } from "./Icons";

const baseTabs = [
  { to: "/", label: "Лента", Icon: HomeIcon },
  { to: "/dating", label: "Знакомства", Icon: HeartIcon },
  { to: "/vacancies", label: "Вакансии", Icon: BriefcaseIcon },
  { to: "/profile", label: "Профиль", Icon: UserIcon },
];

export default function TabBar() {
  const { me } = useMe();
  const tabs = me?.isAdmin ? [...baseTabs, { to: "/admin", label: "Админ", Icon: ShieldIcon }] : baseTabs;

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
