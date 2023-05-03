import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import Plane from "./Plane";
import Form from "./Form";

const SeatSelect = ({ selectedFlight, setReservationId }) => {
  const [selectedSeat, setSelectedSeat] = useState("");

  const navigate = useNavigate();
  const handleSubmit = async (e, formData) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/add-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flight: selectedFlight,
          seat: selectedSeat,
          ...formData,
        }),
      });

      // TODO: Redirect to confirmation page
      const data = await response.json();
      window.localStorage.setItem(
        "reservationId",
        JSON.stringify(data.data.insertedId)
      );
      setReservationId(window.localStorage.getItem("reservationId"));
      // navigate(`/confirmation/${data.data.insertedId}`);
      navigate(`/confirmation`);
    } catch (error) {
      console.error("Error while adding reservation: ", error);
    }
  };

  return (
    <Wrapper>
      <h2>Select your seat and provide your information!</h2>
      <FormWrapper>
        <Plane
          setSelectedSeat={setSelectedSeat}
          selectedFlight={selectedFlight}
        />
        <Form handleSubmit={handleSubmit} selectedSeat={selectedSeat} />
      </FormWrapper>
    </Wrapper>
  );
};

const FormWrapper = styled.div`
  display: flex;
  margin: 50px 0px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

export default SeatSelect;
