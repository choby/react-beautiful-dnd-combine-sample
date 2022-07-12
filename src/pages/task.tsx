import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { ITask } from ".";

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: green;
`;


export default class Task extends React.Component<{
    task: ITask;
    index: number;
}> {
    render() {
        return (
            <Draggable draggableId={this.props.task.id} index={this.props.index}  >
                {(provided, snapshot) => (
                    <Container
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >

                        {this.props.task.id}
                    </Container>
                )}
            </Draggable>
        );
    }
}