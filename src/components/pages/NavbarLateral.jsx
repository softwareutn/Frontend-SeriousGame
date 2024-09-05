import React, { useEffect, useState } from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserPlus,
  faBook,
  faMicroscope,
  faClipboardList,
  faHome,
  faListAlt,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import "../css/NavbarLateral.css";

const LateralNavbar = ({ isOpen, toggleSidebar }) => {
  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    rol: "",
    fecha_registro: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://backend-serious-game.vercel.app/api/auth/perfil",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className={`sidebar ${isOpen ? "" : "closed"}`}>
      <Nav className="flex-column nav-content">
        <Nav.Link as={Link} to="/homepage">
          <FontAwesomeIcon icon={faHome} className="me-2" />
          {isOpen && "Página Principal"}
        </Nav.Link>
        <Nav.Link as={Link} to="/perfil">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          {isOpen && "Perfil"}
        </Nav.Link>
        {userData.rol === "administrador" && (
          <>
            <Nav.Link as={Link} to="/add-user">
              <FontAwesomeIcon icon={faUserPlus} className="me-2" />
              {isOpen && "Agregar Nuevo Usuario"}
            </Nav.Link>
            <Nav.Link as={Link} to="/usuarios">
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              {isOpen && "Usuarios"}
            </Nav.Link>
            <Nav.Link as={Link} to="/categorias">
              <FontAwesomeIcon icon={faListAlt} className="me-2" />
              {isOpen && "Agregar Categorias"}
            </Nav.Link>
          </>
        )}
        <Nav.Link as={Link} to="/conceptos">
          <FontAwesomeIcon icon={faBook} className="me-2" />
          {isOpen && "Conceptos"}
        </Nav.Link>
        <Nav.Link as={Link} to="/ejercicios">
          <FontAwesomeIcon icon={faMicroscope} className="me-2" />
          {isOpen && "Ejercicios"}
        </Nav.Link>
        <Nav.Link as={Link} to="/evaluacion">
          <FontAwesomeIcon icon={faClipboardList} className="me-2" />
          {isOpen && "Evaluación"}
        </Nav.Link>
      </Nav>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? "<" : ">"}
      </button>
    </div>
  );
};

export default LateralNavbar;
