import styled from "styled-components";
import { useEffect, useState } from "react";

const Reservation = () => {
  const [reservationData, setReservationData] = useState([]);

  useEffect(() => {
    fetch("/api/get-reservations")
      .then((res) => res.json())
      .then((data) => {
        setReservationData(data.reservation);
      });
  }, []);

  console.log(reservationData);

  const lastReservation = reservationData[reservationData.length - 1];

  return (
    <Wrapper>
      {lastReservation && (
        <ReservationContainer key={lastReservation.reservation._id}>
          <Header>Reservation № {lastReservation.reservation._id}</Header>
          <Data>
            <p>
              Name:{" "}
              <Span>
                {lastReservation.reservation.givenName}{" "}
                {lastReservation.reservation.surname}
              </Span>
            </p>
            <p>
              Flight: <Span>{lastReservation.reservation.flight}</Span>
            </p>
            <p>
              Seat: <Span>{lastReservation.reservation.seat}</Span>
            </p>
            <p>
              Email: <Span>{lastReservation.reservation.email}</Span>
            </p>
          </Data>
        </ReservationContainer>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 600px;
  margin: 20px;
`;

const ReservationContainer = styled.div`
  border: 3px solid var(--color-alabama-crimson);
  padding: 10px;
  display: flex;
  flex-direction: column;
  margin: 5px;
`;

const Header = styled.h2`
  font-size: 25px;
  color: var(--color-alabama-crimson);
  font-family: "Times New Roman", Times, serif;
  text-align: center;
  width: 100%;
  border-bottom: 2px solid var(--color-alabama-crimson);
`;

const Data = styled.div`
  font-size: 20px;
  font-family: "Times New Roman", Times, serif;
  display: flex;
  flex-direction: column;

  & p {
    padding: 10px 0px;
    margin: 0px;
    font-weight: bold;
  }
`;

const Span = styled.span`
  color: var(--color-alabama-crimson);
  font-weight: bold;
`;

const Tombstone = styled.img`
  width: 200px;
`;

export default Reservation;
