import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  Pagination,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { FaPlus, FaTrash, FaSearch, FaQuestion, FaEdit } from "react-icons/fa";
import "../css/ejercicios.css";
import Layout from "./Layout";
import backgroundImage from "../img/ciencia.jpg";

const useEjercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);

  useEffect(() => {
    fetchEjercicios();
  }, []);

  const fetchEjercicios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://backend-serious-game.vercel.app/api/getejercicios",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEjercicios(response.data);
    } catch (error) {
      console.error("Error al obtener ejercicios:", error);
    }
  };

  const searchEjercicios = async (pregunta) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://backend-serious-game.vercel.app/api/buscarejercicios?pregunta=${pregunta}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEjercicios(response.data);
    } catch (error) {
      console.error("Error al buscar ejercicios:", error);
    }
  };

  const searchEjerciciosByType = async (tipo) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://backend-serious-game.vercel.app/api/busqueda/tipo-ejercicio?tipo=${tipo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEjercicios(response.data);
    } catch (error) {
      console.error("Error al buscar ejercicios por tipo:", error);
    }
  };

  const searchEjerciciosByEstado = async (estado) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://backend-serious-game.vercel.app/api/busqueda/activos?estado=${estado}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEjercicios(response.data);
    } catch (error) {
      console.error("Error al buscar ejercicios por estado:", error);
    }
  };

  return {
    ejercicios,
    fetchEjercicios,
    searchEjercicios,
    searchEjerciciosByType,
    searchEjerciciosByEstado,
  };
};

const usePreguntas = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPreguntas = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        searchQuery
          ? `https://backend-serious-game.vercel.app/api/search/${encodeURIComponent(
              searchQuery
            )}`
          : "https://backend-serious-game.vercel.app/api/preguntas/obtener",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPreguntas(response.data);
    } catch (error) {
      console.error("Error al obtener preguntas:", error);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPreguntas();
  }, [searchQuery, fetchPreguntas]);

  return { preguntas, fetchPreguntas, setSearchQuery };
};

const Ejercicios = () => {
  const {
    ejercicios,
    fetchEjercicios,
    searchEjercicios,
    searchEjerciciosByType,
    searchEjerciciosByEstado,
  } = useEjercicios();
  const { fetchPreguntas } = usePreguntas();
  const [tiposEjercicios, setTiposEjercicios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ejercicioToDelete, setEjercicioToDelete] = useState(null);
  const [currentEjercicio, setCurrentEjercicio] = useState({
    ejercicio_id: null,
    pregunta: "",
    imagen: null,
    tipo_id: "",
    detalles: "",
    mostrar_solucion: false,
    explicacion_solucion: "",
    opciones: Array(4).fill({ texto_opcion: "", es_correcta: false }),
    matriz_punnett: Array(4).fill({ alelo1: "", alelo2: "", resultado: "" }),
    estado: true,
  });
  const [showAddPreguntaModal, setShowAddPreguntaModal] = useState(false);
  const [currentPregunta, setCurrentPregunta] = useState({
    pregunta_id: null,
    texto_pregunta: "",
    imagen: null,
    tipo_pregunta: "Selección Múltiple",
    detalles: "",
    explicacion_solucion: "",
    estado: true,
    opciones: Array(4).fill({ texto_opcion: "", es_correcta: false }),
    concepto_id: null,
    ejercicio_id: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchTiposEjercicios();
  }, []);

  const fetchTiposEjercicios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://backend-serious-game.vercel.app/api/tipos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTiposEjercicios(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de ejercicios:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setCurrentEjercicio({ ...currentEjercicio, imagen: files[0] });
    } else if (type === "checkbox") {
      setCurrentEjercicio({ ...currentEjercicio, [name]: e.target.checked });
    } else {
      setCurrentEjercicio({ ...currentEjercicio, [name]: value || null });
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = currentEjercicio.opciones.map((option, idx) =>
      idx === index ? { ...option, [field]: value } : option
    );
    setCurrentEjercicio({ ...currentEjercicio, opciones: updatedOptions });
  };

  const handlePunnettChange = (index, field, value) => {
    const updatedPunnett = currentEjercicio.matriz_punnett.map((cell, idx) =>
      idx === index ? { ...cell, [field]: value } : cell
    );
    setCurrentEjercicio({
      ...currentEjercicio,
      matriz_punnett: updatedPunnett,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validOptions = currentEjercicio.opciones.filter(
      (op) => op.texto_opcion.trim() !== ""
    );
    if (validOptions.length !== currentEjercicio.opciones.length) {
      toast.error("Todas las opciones deben tener texto antes de guardar.");
      return;
    }

    if (currentEjercicio.tipo_id === "1") {
      const hasCorrectOption = currentEjercicio.opciones.some(
        (op) => op.es_correcta
      );
      if (!hasCorrectOption) {
        toast.error("Debe haber al menos una opción correcta seleccionada.");
        return;
      }
    }

    if (currentEjercicio.tipo_id === "2") {
      const validPunnett = currentEjercicio.matriz_punnett.filter(
        (cell) =>
          cell.alelo1.trim() !== "" &&
          cell.alelo2.trim() !== "" &&
          cell.resultado.trim() !== ""
      );
      if (validPunnett.length !== currentEjercicio.matriz_punnett.length) {
        toast.error(
          "Todas las celdas de la matriz Punnett deben tener texto antes de guardar."
        );
        return;
      }
    }

    const formData = new FormData();
    formData.append("pregunta", currentEjercicio.pregunta);
    formData.append("tipo_id", currentEjercicio.tipo_id);
    formData.append("detalles", currentEjercicio.detalles);
    formData.append("mostrar_solucion", currentEjercicio.mostrar_solucion);
    formData.append(
      "explicacion_solucion",
      currentEjercicio.explicacion_solucion
    );
    formData.append("estado", currentEjercicio.estado);
    formData.append("opcionesMultiples", JSON.stringify(validOptions));

    if (currentEjercicio.tipo_id === "2") {
      const validPunnett = currentEjercicio.matriz_punnett.filter(
        (cell) =>
          cell.alelo1.trim() !== "" &&
          cell.alelo2.trim() !== "" &&
          cell.resultado.trim() !== ""
      );
      formData.append("matrizPunnett", JSON.stringify(validPunnett));
    }

    if (currentEjercicio.imagen && currentEjercicio.imagen instanceof File) {
      formData.append(
        "imagen",
        currentEjercicio.imagen,
        currentEjercicio.imagen.name
      );
    }

    try {
      const token = localStorage.getItem("token");
      const url = currentEjercicio.ejercicio_id
        ? `https://backend-serious-game.vercel.app/api/updateejercicio/${currentEjercicio.ejercicio_id}`
        : "https://backend-serious-game.vercel.app/api/postejercicios";

      await axios({
        method: currentEjercicio.ejercicio_id ? "put" : "post",
        url: url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setShowModal(false);
      fetchEjercicios();
      toast.success(
        `Ejercicio ${
          currentEjercicio.ejercicio_id ? "actualizado" : "agregado"
        } exitosamente.`
      );
    } catch (error) {
      console.error(
        "Error al guardar el ejercicio:",
        error.response?.data || error.message
      );
      toast.error(
        `Error al guardar el ejercicio: ${
          error.response?.data || error.message
        }`
      );
    }
  };

  const handleDelete = async () => {
    if (ejercicioToDelete) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://backend-serious-game.vercel.app/api/deleteejercicio/${ejercicioToDelete}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fetchEjercicios();
        toast.success("Ejercicio eliminado exitosamente.");
      } catch (error) {
        console.error("Error al eliminar el ejercicio:", error);
        toast.error(
          "Hubo un error al eliminar el ejercicio. Inténtalo de nuevo."
        );
      } finally {
        setShowDeleteModal(false);
        setEjercicioToDelete(null);
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const form = e.target;
    const pregunta = form.elements["search_pregunta"].value;
    const tipo = form.elements["tipo_ejercicio"].value;
    const estado = form.elements["estado_ejercicio"].value;

    if (pregunta) {
      await searchEjercicios(pregunta);
    } else if (tipo) {
      await searchEjerciciosByType(tipo);
    } else if (estado) {
      await searchEjerciciosByEstado(estado);
    }
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ejercicios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ejercicios.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEstadoChange = async (ejercicio) => {
    const updatedEjercicio = { ...ejercicio, estado: !ejercicio.estado };

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://backend-serious-game.vercel.app/api/updateejercicio/${ejercicio.ejercicio_id}`,
        updatedEjercicio,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchEjercicios();
      toast.success("Estado del ejercicio actualizado.");
    } catch (error) {
      console.error("Error al actualizar el estado del ejercicio:", error);
      toast.error("Error al actualizar el estado del ejercicio.");
    }
  };

  const handleAddPreguntaChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setCurrentPregunta({ ...currentPregunta, imagen: files[0] });
    } else if (type === "checkbox") {
      setCurrentPregunta({ ...currentPregunta, [name]: e.target.checked });
    } else {
      setCurrentPregunta({ ...currentPregunta, [name]: value || null });
    }
  };

  const handleAddPreguntaOptionChange = (index, field, value) => {
    const updatedOptions = currentPregunta.opciones.map((option, idx) =>
      idx === index ? { ...option, [field]: value } : option
    );
    setCurrentPregunta({ ...currentPregunta, opciones: updatedOptions });
  };

  const handleAddPreguntaSubmit = async (e) => {
    e.preventDefault();

    const validOptions = currentPregunta.opciones.filter(
      (op) => op.texto_opcion.trim() !== ""
    );

    if (validOptions.length !== currentPregunta.opciones.length) {
      toast.error("Todas las opciones deben tener texto antes de guardar.");
      return;
    }

    const formData = new FormData();
    formData.append("texto_pregunta", currentPregunta.texto_pregunta);
    formData.append("tipo_pregunta", "Selección Múltiple");
    formData.append("detalles", currentPregunta.detalles);
    formData.append(
      "explicacion_solucion",
      currentPregunta.explicacion_solucion
    );
    formData.append("estado", currentPregunta.estado);
    formData.append("opciones", JSON.stringify(validOptions));
    formData.append(
      "concepto_id",
      currentPregunta.concepto_id !== null ? currentPregunta.concepto_id : ""
    );
    formData.append(
      "ejercicio_id",
      currentPregunta.ejercicio_id !== null ? currentPregunta.ejercicio_id : ""
    );

    if (currentPregunta.imagen && currentPregunta.imagen instanceof File) {
      formData.append(
        "imagen",
        currentPregunta.imagen,
        currentPregunta.imagen.name
      );
    }

    try {
      const token = localStorage.getItem("token");
      const url = "https://backend-serious-game.vercel.app/api/preguntas";

      await axios({
        method: "post",
        url: url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setShowAddPreguntaModal(false);
      fetchPreguntas();
      toast.success("Pregunta agregada exitosamente.");
    } catch (error) {
      console.error(
        "Error al guardar la pregunta:",
        error.response?.data || error.message
      );
      toast.error(
        `Error al guardar la pregunta: ${error.response?.data || error.message}`
      );
    }
  };

  const handleEdit = async (ejercicioId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://backend-serious-game.vercel.app/api/getejercicios/${ejercicioId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const ejercicio = response.data;
      setCurrentEjercicio({
        ejercicio_id: ejercicio.ejercicio_id,
        pregunta: ejercicio.pregunta,
        imagen: null,
        tipo_id: ejercicio.tipo_id.toString(),
        detalles: ejercicio.detalles,
        mostrar_solucion: ejercicio.mostrar_solucion,
        explicacion_solucion: ejercicio.explicacion_solucion,
        opciones:
          ejercicio.opciones_multiples ||
          Array(4).fill({ texto_opcion: "", es_correcta: false }),
        matriz_punnett:
          ejercicio.matriz_punnett ||
          Array(4).fill({ alelo1: "", alelo2: "", resultado: "" }),
        estado: ejercicio.estado,
      });
      setIsEditing(true);
      setShowModal(true);
    } catch (error) {
      console.error("Error al obtener el ejercicio:", error);
    }
  };

  const renderPaginationItems = () => {
    const visiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    const paginationItems = [];
    for (let number = startPage; number <= endPage; number++) {
      paginationItems.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return paginationItems;
  };

  return (
    <Layout pageTitle="Gestión de Ejercicios">
      <ToastContainer />
      <Container
        fluid
        className="p-4 d-flex flex-column align-items-center justify-content-start"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "30px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "15px",
            borderRadius: "15px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "1200px",
            width: "100%",
            marginBottom: "20px",
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Panel de Administración de Ejercicios
        </div>

        <Form
          onSubmit={handleSearch}
          className="d-flex justify-content-between mb-3 w-100 search-form"
          style={{ maxWidth: "1200px" }}
        >
          <Row className="w-100">
            <Col>
              <Form.Control
                type="text"
                name="search_pregunta"
                placeholder="Buscar por pregunta"
                className="mb-2"
              />
            </Col>
            <Col>
              <Form.Control as="select" name="tipo_ejercicio" className="mb-2">
                <option value="">Todos los tipos</option>
                <option value="seleccion_multiple">Selección Múltiple</option>
                <option value="punnett">Punnett</option>
              </Form.Control>
            </Col>
            <Col>
              <Form.Control
                as="select"
                name="estado_ejercicio"
                className="mb-2"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </Form.Control>
            </Col>
            <Col xs="auto">
              <Button type="submit" variant="primary" className="w-100">
                <FaSearch /> Buscar
              </Button>
            </Col>
          </Row>
        </Form>

        <div
          className="custom-container"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "1200px",
            overflowY: "auto",
            maxHeight: "500px",
          }}
        >
          <Row className="justify-content-md-center">
            <Col xs={12}>
              <Button
                variant="primary"
                className="mb-2 add-button float-end"
                onClick={() => {
                  setCurrentEjercicio({
                    ejercicio_id: null,
                    pregunta: "",
                    imagen: null,
                    tipo_id: "",
                    detalles: "",
                    mostrar_solucion: false,
                    explicacion_solucion: "",
                    opciones: Array(4).fill({
                      texto_opcion: "",
                      es_correcta: false,
                    }),
                    matriz_punnett: Array(4).fill({
                      alelo1: "",
                      alelo2: "",
                      resultado: "",
                    }),
                    estado: true,
                  });
                  setIsEditing(false);
                  setShowModal(true);
                }}
              >
                <FaPlus /> Agregar Ejercicio
              </Button>

              <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton className="modal-header-custom">
                  <Modal.Title>
                    {currentEjercicio.ejercicio_id ? "Editar" : "Agregar"}{" "}
                    Ejercicio
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        name="pregunta"
                        required
                        value={currentEjercicio.pregunta}
                        onChange={handleInputChange}
                        placeholder="Escribe la pregunta"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Imagen</Form.Label>
                      <Form.Control type="file" onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Ejercicio</Form.Label>
                      <Form.Control
                        as="select"
                        name="tipo_id"
                        required
                        value={currentEjercicio.tipo_id}
                        onChange={handleInputChange}
                        disabled={isEditing}
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposEjercicios.map((tipo) => (
                          <option key={tipo.tipo_id} value={tipo.tipo_id}>
                            {tipo.nombre_tipo}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Detalles</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="detalles"
                        required
                        value={currentEjercicio.detalles}
                        onChange={handleInputChange}
                        placeholder="Detalles adicionales"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Mostrar Solución"
                        name="mostrar_solucion"
                        checked={currentEjercicio.mostrar_solucion}
                        onChange={(e) =>
                          setCurrentEjercicio({
                            ...currentEjercicio,
                            mostrar_solucion: e.target.checked,
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Explicación de la Solución</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="explicacion_solucion"
                        required
                        value={currentEjercicio.explicacion_solucion}
                        onChange={handleInputChange}
                        placeholder="Explica la solución"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Activo"
                        name="estado"
                        checked={currentEjercicio.estado}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    {currentEjercicio.tipo_id === "1" && (
                      <>
                        <Form.Label>Opciones</Form.Label>
                        {currentEjercicio.opciones.map((opcion, index) => (
                          <div key={index} className="mb-3">
                            <div className="option-group">
                              <Form.Control
                                type="text"
                                placeholder="Texto de la opción"
                                value={opcion.texto_opcion || ""}
                                onChange={(e) =>
                                  handleOptionChange(
                                    index,
                                    "texto_opcion",
                                    e.target.value
                                  )
                                }
                                required
                              />
                              <Form.Check
                                type="checkbox"
                                label="Correcta"
                                checked={opcion.es_correcta}
                                onChange={(e) =>
                                  handleOptionChange(
                                    index,
                                    "es_correcta",
                                    e.target.checked
                                  )
                                }
                                className="ms-2"
                              />
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {currentEjercicio.tipo_id === "2" && (
                      <>
                        <Form.Label>
                          Llene los datos para la matriz de Punnett
                        </Form.Label>
                        {currentEjercicio.matriz_punnett.map((cell, index) => (
                          <Row key={index} className="mb-3">
                            <Col>
                              <Form.Control
                                type="text"
                                placeholder="Alelo 1"
                                value={cell.alelo1 || ""}
                                onChange={(e) =>
                                  handlePunnettChange(
                                    index,
                                    "alelo1",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </Col>
                            <Col>
                              <Form.Control
                                type="text"
                                placeholder="Alelo 2"
                                value={cell.alelo2 || ""}
                                onChange={(e) =>
                                  handlePunnettChange(
                                    index,
                                    "alelo2",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </Col>
                            <Col>
                              <Form.Control
                                type="text"
                                placeholder="Resultado"
                                value={cell.resultado || ""}
                                onChange={(e) =>
                                  handlePunnettChange(
                                    index,
                                    "resultado",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </Col>
                          </Row>
                        ))}
                      </>
                    )}

                    <Button type="submit" variant="success" className="mt-3">
                      Guardar
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>

              <Modal
                show={showAddPreguntaModal}
                onHide={() => setShowAddPreguntaModal(false)}
                size="lg"
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton className="modal-header-custom">
                  <Modal.Title>Agregar Pregunta</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                  <Form onSubmit={handleAddPreguntaSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Texto de la Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="texto_pregunta"
                        value={currentPregunta.texto_pregunta}
                        onChange={handleAddPreguntaChange}
                        placeholder="Escribe la pregunta"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Imagen</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleAddPreguntaChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Pregunta</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        name="tipo_pregunta"
                        value={currentPregunta.tipo_pregunta}
                        onChange={handleAddPreguntaChange}
                        readOnly
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Detalles</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        required
                        name="detalles"
                        value={currentPregunta.detalles}
                        onChange={handleAddPreguntaChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Explicación Solución</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        required
                        name="explicacion_solucion"
                        value={currentPregunta.explicacion_solucion}
                        onChange={handleAddPreguntaChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Activo"
                        name="estado"
                        checked={currentPregunta.estado}
                        onChange={handleAddPreguntaChange}
                      />
                    </Form.Group>
                    <Form.Label>Opciones</Form.Label>
                    {currentPregunta.opciones.map((opcion, index) => (
                      <div key={index} className="mb-3">
                        <div className="option-group">
                          <Form.Control
                            type="text"
                            placeholder="Texto de la opción"
                            value={opcion.texto_opcion || ""}
                            onChange={(e) =>
                              handleAddPreguntaOptionChange(
                                index,
                                "texto_opcion",
                                e.target.value
                              )
                            }
                            required
                          />
                          <Form.Check
                            type="checkbox"
                            label="Correcta"
                            checked={opcion.es_correcta}
                            onChange={(e) =>
                              handleAddPreguntaOptionChange(
                                index,
                                "es_correcta",
                                e.target.checked
                              )
                            }
                            className="ms-2"
                          />
                        </div>
                      </div>
                    ))}
                    <Button type="submit" variant="success" className="mt-3">
                      Guardar
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>

              <Table
                striped
                bordered
                hover
                responsive
                className="mt-2 table-responsive"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pregunta</th>
                    <th>Imagen</th>
                    <th>Tipo de Ejercicio</th>
                    <th>Detalles</th>
                    <th>Explicación Solución</th>
                    <th>Opciones</th>
                    <th>Punnett</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((ejercicio, index) => (
                    <tr key={ejercicio.ejercicio_id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{ejercicio.pregunta}</td>
                      <td>
                        {ejercicio.imagen && (
                          <img
                            src={`https://backend-serious-game.vercel.app/src/uploads/${ejercicio.imagen}`}
                            alt={`https://backend-serious-game.vercel.app/${ejercicio.imagen}`}
                            className="pregunta-imagen"
                          />
                        )}
                      </td>
                      <td>{ejercicio.nombre_tipo}</td>
                      <td>{ejercicio.detalles}</td>
                      <td>{ejercicio.explicacion_solucion}</td>
                      <td>
                        {ejercicio.opciones_multiples?.length > 0
                          ? ejercicio.opciones_multiples?.map((opc, idx) => (
                              <div key={idx}>
                                {opc.texto_opcion}(
                                {opc.es_correcta ? "Correcta" : "Incorrecta"})
                              </div>
                            ))
                          : "No existe"}
                      </td>
                      <td>
                        {ejercicio.matriz_punnett?.length > 0
                          ? ejercicio.matriz_punnett?.map((cell, idx) => (
                              <div key={idx}>
                                {cell?.alelo1} x {cell?.alelo2} ={" "}
                                {cell?.resultado}
                              </div>
                            ))
                          : "No existe"}
                      </td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={ejercicio.estado}
                          onChange={() => handleEstadoChange(ejercicio)}
                        />
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="danger"
                            onClick={() => {
                              setEjercicioToDelete(ejercicio.ejercicio_id);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FaTrash />
                          </Button>
                          <Button
                            variant="warning"
                            onClick={() => handleEdit(ejercicio.ejercicio_id)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setCurrentPregunta({
                                pregunta_id: null,
                                texto_pregunta: "",
                                imagen: null,
                                tipo_pregunta: "Selección Múltiple",
                                detalles: "",
                                explicacion_solucion: "",
                                estado: true,
                                opciones: Array(4).fill({
                                  texto_opcion: "",
                                  es_correcta: false,
                                }),
                                concepto_id: null,
                                ejercicio_id: ejercicio.ejercicio_id,
                              });
                              setShowAddPreguntaModal(true);
                            }}
                          >
                            <FaQuestion />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {renderPaginationItems()}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        size="lg"
        dialogClassName="modal-50w no-scroll"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom">
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <p>¿Estás seguro de que deseas eliminar este ejercicio?</p>
          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="me-2"
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Ejercicios;
