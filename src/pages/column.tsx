import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { IColumn, ITask } from ".";
import Task from './task';

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
`;
const Title = styled.h3`
  padding: 8px;
`;
const TaskList = styled.div`
  padding: 8px;
`;

export default class Column extends React.Component<{
    column: IColumn;
    tasks: ITask[];
    group: {
        [key: string]: ITask[];
    };
}> {
    render() {
        return (
            <Container>
                <Title>{this.props.column.title}</Title>
                <Droppable droppableId={this.props.column.id} isCombineEnabled>
                    {provided => <>
                        <TaskList
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {this.props.tasks.map((task, index) => (
                                <Task key={task.id} task={task} index={index} />
                            ))}
                            {provided.placeholder}
                        </TaskList>
                        {
                            Object.keys(this.props.group).map(g => <Container>
                                <Droppable droppableId={g}>
                                    {provided =>
                                        <TaskList
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {this.props.group[g].map((task, index) => (
                                                <Task key={task.id} task={task} index={index} />
                                            ))}
                                            {provided.placeholder}
                                        </TaskList>
                                    }
                                </Droppable> </Container>)
                        }
                    </>
                    }

                </Droppable>

            </Container>
        );
    }
}