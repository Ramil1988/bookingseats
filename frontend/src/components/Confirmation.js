import styled from "styled-components";
import { useEffect, useState } from "react";

import tombstone from "../assets/tombstone.png";

const Confirmation = () => {
  const [confirmationData, setConfirmationData] = useState();

  useEffect(() => {
    const reservId = window.localStorage.reservationId;
    fetch(`/api/get-reservation/${reservId.replace(/['"]+/g, "")}`)
      .then((res) => res.json())
      .then((data) => {
        setConfirmationData(data.reservation);
      });
  }, []);

  return (
    <Wrapper>
      {confirmationData && (
        <ConfirmationContainer>
          <Header>Your Flight is Confirmed</Header>
          <Data>
            <p>
              Confirmation #: <Span>{confirmationData._id}</Span>
            </p>
            <p>
              Name:{" "}
              <Span>
                {confirmationData.givenName} {confirmationData.surname}
              </Span>
            </p>
            <p>
              Flight: <Span>{confirmationData.flight}</Span>
            </p>
            <p>
              Seat: <Span>{confirmationData.seat}</Span>
            </p>
            <p>
              Email: <Span>{confirmationData.email}</Span>
            </p>
          </Data>
        </ConfirmationContainer>
      )}
      <Tombstone src={tombstone} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70%;
  margin: auto;
`;

const ConfirmationContainer = styled.div`
  border: 3px solid var(--color-alabama-crimson);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const Header = styled.h2`
  font-size: 28px;
  font-family: "Times New Roman", Times, serif;
  color: var(--color-alabama-crimson);
  text-align: center;
  width: 100%;
  border-bottom: 2px solid var(--color-alabama-crimson);
`;

const Data = styled.div`
  font-size: 20px;
  font-family: "Times New Roman", Times, serif;
  display: flex;
  flex-direction: column;
  padding: 20px 0px;

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

export default Confirmation;
